/**
 * Virtual Joystick Web Component.
 *
 * @example
 * ```html
 * <virtual-joystick
 *   mode="static"
 *   theme="modern"
 *   size="100"
 * ></virtual-joystick>
 * ```
 */

import { styles } from './joystick.styles';
import type {
  JoystickMode,
  JoystickShape,
  JoystickTheme,
  JoystickMoveData,
  JoystickStartData,
  JoystickEndData,
} from './joystick.types';
import { InputManager, type InputData } from '../../core/input-manager';
import {
  clampToCircle,
  clampToSquare,
  calculateAngle,
  normalizeVector,
  getCompassDirection,
  distance,
  type Point,
} from '../../core/math-utils';
import { getLocalPosition } from '../../core/transform-utils';

export class VirtualJoystickElement extends HTMLElement {
  static tagName = 'virtual-joystick';

  static get observedAttributes(): string[] {
    return [
      'mode',
      'theme',
      'size',
      'threshold',
      'shape',
      'lock-x',
      'lock-y',
      'catch-distance',
      'no-rest',
      'data-only',
    ];
  }

  #shadow: ShadowRoot | null = null;
  readonly #inputManager = new InputManager();

  #container: HTMLDivElement | null = null;
  #nub: HTMLDivElement | null = null;

  // State
  #activeInput: number | null = null;
  #center: Point = { x: 0, y: 0 };
  #semiModeBasePosition: Point | null = null; // Base position for semi mode
  #animationFrameId: number | null = null;
  #pendingMoveData: JoystickMoveData | null = null;
  #lastCompass: string = ''; // For capture/release tracking (dondido pattern)

  // Bound handlers for cleanup
  readonly #boundPointerDown = this.#handlePointerDown.bind(this);
  readonly #boundTouchStart = this.#handleTouchStart.bind(this);
  readonly #boundTouchMove = this.#handleTouchMove.bind(this);
  readonly #boundTouchEnd = this.#handleTouchEnd.bind(this);
  readonly #boundMouseDown = this.#handleMouseDown.bind(this);

  constructor() {
    super();
    // Shadow DOM is attached lazily in connectedCallback (not needed for data-only mode)

    // Setup input manager callbacks
    this.#inputManager
      .onStart((input) => this.#onInputStart(input))
      .onMove((input) => this.#onInputMove(input))
      .onEnd((input) => this.#onInputEnd(input));
  }

  // =====================
  // Attribute getters/setters
  // =====================

  get mode(): JoystickMode {
    return (this.getAttribute('mode') as JoystickMode) || 'dynamic';
  }
  set mode(value: JoystickMode) {
    this.setAttribute('mode', value);
  }

  get theme(): JoystickTheme {
    return (this.getAttribute('theme') as JoystickTheme) || 'modern';
  }
  set theme(value: JoystickTheme) {
    this.setAttribute('theme', value);
  }

  get size(): number {
    const val = parseInt(this.getAttribute('size') || '100', 10);
    return Number.isNaN(val) || val <= 0 ? 100 : val;
  }
  set size(value: number) {
    this.setAttribute('size', String(value));
  }

  get threshold(): number {
    const val = parseFloat(this.getAttribute('threshold') || '0.1');
    return Number.isNaN(val) ? 0.1 : Math.max(0, Math.min(1, val));
  }
  set threshold(value: number) {
    this.setAttribute('threshold', String(value));
  }

  get shape(): JoystickShape {
    return (this.getAttribute('shape') as JoystickShape) || 'circle';
  }
  set shape(value: JoystickShape) {
    this.setAttribute('shape', value);
  }

  get lockX(): boolean {
    return this.hasAttribute('lock-x');
  }
  set lockX(value: boolean) {
    this.toggleAttribute('lock-x', value);
  }

  get lockY(): boolean {
    return this.hasAttribute('lock-y');
  }
  set lockY(value: boolean) {
    this.toggleAttribute('lock-y', value);
  }

  get catchDistance(): number {
    const val = parseInt(this.getAttribute('catch-distance') || '50', 10);
    return Number.isNaN(val) || val < 0 ? 50 : val;
  }
  set catchDistance(value: number) {
    this.setAttribute('catch-distance', String(value));
  }

  get restJoystick(): boolean {
    return !this.hasAttribute('no-rest');
  }
  set restJoystick(value: boolean) {
    this.toggleAttribute('no-rest', !value);
  }

  get dataOnly(): boolean {
    return this.hasAttribute('data-only');
  }
  set dataOnly(value: boolean) {
    this.toggleAttribute('data-only', value);
  }

  // =====================
  // Lifecycle
  // =====================

  connectedCallback(): void {
    this.#render();
    this.#setupEventListeners();
  }

  disconnectedCallback(): void {
    this.#cleanup();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue !== newValue) {
      this.#handleAttributeChange(name, newValue);
    }
  }

  // =====================
  // Rendering
  // =====================

  #render(): void {
    if (this.dataOnly) return;

    // Lazy shadow DOM attachment
    if (!this.#shadow) {
      this.#shadow = this.attachShadow({ mode: 'open' });
      this.#shadow.adoptedStyleSheets = [styles];
    }

    this.#shadow.innerHTML = `
      <div class="container" part="container">
        <div class="pad" part="pad"></div>
        <div class="nub" part="nub"></div>
      </div>
    `;

    this.#container = this.#shadow.querySelector('.container');
    this.#nub = this.#shadow.querySelector('.nub');

    this.#updateSize();
  }

  #updateSize(): void {
    if (this.#container) {
      this.#container.style.setProperty('--vj-size', `${this.size}px`);
    }
  }

  // =====================
  // Event Listeners
  // =====================

  #setupEventListeners(): void {
    // Use Pointer Events if available (handles touch + mouse + pen)
    if (InputManager.supportsPointer) {
      this.addEventListener('pointerdown', this.#boundPointerDown);
    } else {
      // Fallback: Touch + Mouse events
      this.addEventListener('touchstart', this.#boundTouchStart, {
        passive: false,
      });
      this.addEventListener('touchmove', this.#boundTouchMove, { passive: false });
      this.addEventListener('touchend', this.#boundTouchEnd);
      this.addEventListener('touchcancel', this.#boundTouchEnd);

      // Mouse events for desktop
      this.addEventListener('mousedown', this.#boundMouseDown);
    }
    // Note: visibilitychange is handled by InputManager singleton
  }

  #cleanup(): void {
    // Remove Pointer events
    this.removeEventListener('pointerdown', this.#boundPointerDown);

    // Remove Touch events
    this.removeEventListener('touchstart', this.#boundTouchStart);
    this.removeEventListener('touchmove', this.#boundTouchMove);
    this.removeEventListener('touchend', this.#boundTouchEnd);
    this.removeEventListener('touchcancel', this.#boundTouchEnd);

    // Remove Mouse events
    this.removeEventListener('mousedown', this.#boundMouseDown);

    if (this.#animationFrameId !== null) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }

    this.#inputManager.destroy();
  }

  // =====================
  // Event Handlers
  // =====================

  #handlePointerDown(event: PointerEvent): void {
    event.preventDefault(); // Prevent default behaviors
    event.stopPropagation();
    this.#inputManager.handlePointerDown(event);
  }

  #handleTouchStart(event: TouchEvent): void {
    event.preventDefault(); // Prevent iOS zoom (#185)
    event.stopPropagation();
    this.#inputManager.handleTouchStart(event);
  }

  #handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    this.#inputManager.handleTouchMove(event);
  }

  #handleTouchEnd(event: TouchEvent): void {
    // NOTE: No preventDefault here - Firefox Android fix (#231, #189)
    this.#inputManager.handleTouchEnd(event);
  }

  #handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.#inputManager.handleMouseDown(event);
  }

  // =====================
  // Input Manager Callbacks
  // =====================

  #onInputStart(input: InputData): void {
    // Only track one input at a time for this joystick
    if (this.#activeInput !== null) return;

    const inputPoint = { x: input.startX, y: input.startY };

    // Calculate center based on mode
    switch (this.mode) {
      case 'static':
        // Static mode: use fixed container position
        if (this.#container) {
          const rect = this.#container.getBoundingClientRect();
          this.#center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
        break;

      case 'semi':
        // Semi mode: catch existing joystick if within catchDistance
        // Compare against the CURRENT container center, not the stored base position
        if (this.#container) {
          const containerRect = this.#container.getBoundingClientRect();
          const containerCenter = {
            x: containerRect.left + containerRect.width / 2,
            y: containerRect.top + containerRect.height / 2,
          };

          if (this.#semiModeBasePosition) {
            // Joystick already exists - check if we can catch it
            const dist = distance(inputPoint, containerCenter);
            if (dist <= this.catchDistance) {
              // Catch: use the container's current center
              this.#center = containerCenter;
            } else {
              // Too far: move joystick to input location
              this.#center = inputPoint;
              this.#semiModeBasePosition = { ...inputPoint };
              this.#positionContainerAt(inputPoint);
            }
          } else {
            // First input: initialize at input location
            this.#center = inputPoint;
            this.#semiModeBasePosition = { ...inputPoint };
            this.#positionContainerAt(inputPoint);
          }
        } else {
          // Container not yet rendered, use input location
          this.#center = inputPoint;
          this.#semiModeBasePosition = { ...inputPoint };
        }
        break;

      case 'dynamic':
      default:
        // Dynamic mode: always create joystick at input location
        this.#center = inputPoint;
        this.#positionContainerAt(inputPoint);
        break;
    }

    this.#activeInput = input.identifier;
    this.#container?.classList.add('active');

    // Emit start event
    this.#emitEvent<JoystickStartData>('joystick-start', {
      identifier: input.identifier,
      position: inputPoint,
      timestamp: performance.now(),
    });
  }

  /**
   * Position the container centered at a given point.
   * For dynamic mode: uses viewport coords (position: fixed).
   * For static/semi modes: converts to local coords with transform compensation (#222).
   */
  #positionContainerAt(point: Point): void {
    if (!this.#container) return;

    // Dynamic mode uses position: fixed, so use viewport coords directly
    // Static and semi modes use position: relative/absolute, so convert to local coords
    if (this.mode === 'dynamic') {
      this.#container.style.left = `${point.x - this.size / 2}px`;
      this.#container.style.top = `${point.y - this.size / 2}px`;
    } else {
      // static/semi: position: relative/absolute uses local coordinates
      const localPos = getLocalPosition(point.x, point.y, this);
      this.#container.style.left = `${localPos.x - this.size / 2}px`;
      this.#container.style.top = `${localPos.y - this.size / 2}px`;
    }
  }

  #onInputMove(input: InputData): void {
    if (input.identifier !== this.#activeInput) return;

    // Calculate position relative to center
    let deltaX = input.currentX - this.#center.x;
    let deltaY = input.currentY - this.#center.y;

    // Apply axis locks
    if (this.lockX) deltaX = 0;
    if (this.lockY) deltaY = 0;

    const radius = this.size / 2;

    // Clamp to shape
    let clamped: Point;
    if (this.shape === 'square') {
      clamped = clampToSquare(deltaX, deltaY, radius);
    } else {
      clamped = clampToCircle(deltaX, deltaY, radius);
    }

    // Calculate move data
    const distance = Math.sqrt(clamped.x ** 2 + clamped.y ** 2);
    const force = Math.min(distance / radius, 1);

    // Apply deadzone threshold
    if (force < this.threshold) {
      clamped = { x: 0, y: 0 };
    }

    // Calculate angle (with locks already applied to delta)
    const angleData = calculateAngle(clamped.x, clamped.y, false, false);

    // Calculate compass direction (dondido pattern)
    const compass = getCompassDirection(angleData.degree, force, this.threshold);

    // Create move data
    const moveData: JoystickMoveData = {
      identifier: input.identifier,
      position: {
        x: clamped.x / radius,
        y: clamped.y / radius,
      },
      rawPosition: clamped,
      force,
      distance,
      angle: angleData,
      compass,
      vector: normalizeVector(clamped.x, clamped.y),
      timestamp: performance.now(),
    };

    // Capture/Release tracking (dondido pattern)
    // Capture = directions in new but not in old
    // Release = directions in old but not in new
    const capture = this.#getNewChars(this.#lastCompass, compass);
    const release = this.#getNewChars(compass, this.#lastCompass);
    this.#lastCompass = compass;

    // Dataset output for polling (dondido pattern - alternative to events)
    this.dataset.x = String(moveData.position.x);
    this.dataset.y = String(moveData.position.y);
    this.dataset.force = String(force);
    this.dataset.compass = compass;
    this.dataset.degree = String(angleData.degree);
    this.dataset.capture = capture;
    this.dataset.release = release;

    // RAF batching for performance (#168)
    this.#pendingMoveData = moveData;

    if (this.#animationFrameId === null) {
      this.#animationFrameId = requestAnimationFrame(() => {
        if (this.#pendingMoveData) {
          this.#updateNubPosition(this.#pendingMoveData.rawPosition);
          this.#emitEvent<JoystickMoveData>('joystick-move', this.#pendingMoveData);
        }
        this.#animationFrameId = null;
      });
    }
  }

  #onInputEnd(input: InputData): void {
    if (input.identifier !== this.#activeInput) return;

    this.#activeInput = null;
    this.#container?.classList.remove('active');

    // Reset nub position
    if (this.restJoystick) {
      this.#updateNubPosition({ x: 0, y: 0 });
    }

    // Reset dataset (dondido pattern)
    this.dataset.x = '0';
    this.dataset.y = '0';
    this.dataset.force = '0';
    this.dataset.compass = '';
    this.dataset.degree = '0';
    this.dataset.capture = '';
    this.dataset.release = this.#lastCompass; // Release all active directions
    this.#lastCompass = '';

    // Note: In dynamic mode, the CSS handles hiding via .active class removal
    // In semi mode, #semiModeBasePosition persists for catching on next input

    // Emit end event
    this.#emitEvent<JoystickEndData>('joystick-end', {
      identifier: input.identifier,
      timestamp: performance.now(),
    });
  }

  // =====================
  // Direction Tracking (dondido pattern)
  // =====================

  /**
   * Get characters that are in `newStr` but not in `oldStr`.
   * Used for capture/release tracking.
   * Example: getNewChars('n', 'ne') returns 'e' (new direction captured)
   */
  #getNewChars(oldStr: string, newStr: string): string {
    let result = '';
    for (const char of newStr) {
      if (!oldStr.includes(char)) {
        result += char;
      }
    }
    return result;
  }

  // =====================
  // Visual Updates
  // =====================

  #updateNubPosition(position: Point): void {
    if (!this.#nub || this.dataOnly) return;

    // Use CSS vars for position (dondido pattern - more efficient)
    this.#nub.style.setProperty('--vj-nub-x', `${position.x}px`);
    this.#nub.style.setProperty('--vj-nub-y', `${position.y}px`);
  }

  // =====================
  // Event Emission
  // =====================

  #emitEvent<T>(name: string, detail: T): void {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true, // CRITICAL: Cross Shadow DOM boundary
      })
    );
  }

  // =====================
  // Attribute Changes
  // =====================

  #handleAttributeChange(name: string, value: string | null): void {
    switch (name) {
      case 'size':
        this.#updateSize();
        break;
      case 'data-only':
        if (value !== null && this.#shadow) {
          // Switched to data-only, clear DOM
          this.#shadow.innerHTML = '';
          this.#container = null;
          this.#nub = null;
        } else if (value === null && !this.#container) {
          // Switched from data-only, render DOM
          this.#render();
        }
        break;
    }
  }

  // =====================
  // Static Registration
  // =====================

  static register(): void {
    if (!customElements.get(this.tagName)) {
      customElements.define(this.tagName, this);
    }
  }
}
