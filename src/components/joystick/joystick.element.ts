/**
 * Virtual Joystick Web Component.
 *
 * @example
 * ```html
 * <virtual-joystick
 *   mode="static"
 *   theme="pixel-art"
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
import { TouchManager, type TouchData } from '../../core/touch-manager';
import {
  clampToCircle,
  clampToSquare,
  calculateAngle,
  normalizeVector,
  getDirection,
  type Point,
} from '../../core/math-utils';

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
      'follow',
      'rest-joystick',
      'data-only',
    ];
  }

  readonly #shadow: ShadowRoot;
  readonly #touchManager = new TouchManager();

  #container: HTMLDivElement | null = null;
  #nub: HTMLDivElement | null = null;

  // State
  #activeTouch: number | null = null;
  #center: Point = { x: 0, y: 0 };
  #animationFrameId: number | null = null;
  #pendingMoveData: JoystickMoveData | null = null;

  // Bound handlers for cleanup
  readonly #boundTouchStart = this.#handleTouchStart.bind(this);
  readonly #boundTouchMove = this.#handleTouchMove.bind(this);
  readonly #boundTouchEnd = this.#handleTouchEnd.bind(this);
  readonly #boundVisibilityChange = this.#handleVisibilityChange.bind(this);

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.adoptedStyleSheets = [styles];

    // Setup touch manager callbacks
    this.#touchManager
      .onStart((touch) => this.#onTouchStart(touch))
      .onMove((touch) => this.#onTouchMove(touch))
      .onEnd((touch) => this.#onTouchEnd(touch));
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
    return parseInt(this.getAttribute('size') || '100', 10);
  }
  set size(value: number) {
    this.setAttribute('size', String(value));
  }

  get threshold(): number {
    return parseFloat(this.getAttribute('threshold') || '0.1');
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
    return parseInt(this.getAttribute('catch-distance') || '50', 10);
  }
  set catchDistance(value: number) {
    this.setAttribute('catch-distance', String(value));
  }

  get follow(): boolean {
    return this.hasAttribute('follow');
  }
  set follow(value: boolean) {
    this.toggleAttribute('follow', value);
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

    this.#shadow.innerHTML = `
      <div class="container">
        <div class="pad"></div>
        <div class="nub"></div>
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
    // Use the element itself as touch target for all modes
    this.addEventListener('touchstart', this.#boundTouchStart, {
      passive: false,
    });
    this.addEventListener('touchmove', this.#boundTouchMove, { passive: false });
    this.addEventListener('touchend', this.#boundTouchEnd);
    this.addEventListener('touchcancel', this.#boundTouchEnd);

    // Handle visibility change (app switch, tab change)
    document.addEventListener('visibilitychange', this.#boundVisibilityChange);
  }

  #cleanup(): void {
    this.removeEventListener('touchstart', this.#boundTouchStart);
    this.removeEventListener('touchmove', this.#boundTouchMove);
    this.removeEventListener('touchend', this.#boundTouchEnd);
    this.removeEventListener('touchcancel', this.#boundTouchEnd);

    document.removeEventListener(
      'visibilitychange',
      this.#boundVisibilityChange
    );

    if (this.#animationFrameId !== null) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }

    this.#touchManager.destroy();
  }

  // =====================
  // Touch Handlers
  // =====================

  #handleTouchStart(event: TouchEvent): void {
    event.preventDefault(); // Prevent iOS zoom (#185)
    event.stopPropagation();
    this.#touchManager.handleTouchStart(event);
  }

  #handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    this.#touchManager.handleTouchMove(event);
  }

  #handleTouchEnd(event: TouchEvent): void {
    // NOTE: No preventDefault here - Firefox Android fix (#231, #189)
    this.#touchManager.handleTouchEnd(event);
  }

  #handleVisibilityChange(): void {
    if (document.hidden) {
      this.#touchManager.releaseAll();
    }
  }

  // =====================
  // Touch Manager Callbacks
  // =====================

  #onTouchStart(touch: TouchData): void {
    // Only track one touch at a time for this joystick
    if (this.#activeTouch !== null) return;

    this.#activeTouch = touch.identifier;

    // Calculate center based on mode
    if (this.mode === 'static' && this.#container) {
      const rect = this.#container.getBoundingClientRect();
      this.#center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    } else {
      // Dynamic/semi: center is where touch started
      this.#center = { x: touch.startX, y: touch.startY };

      // Position container at touch location
      if (this.#container && this.mode === 'dynamic') {
        this.#container.style.left = `${touch.startX - this.size / 2}px`;
        this.#container.style.top = `${touch.startY - this.size / 2}px`;
      }
    }

    this.#container?.classList.add('active');

    // Emit start event
    this.#emitEvent<JoystickStartData>('joystick-start', {
      identifier: touch.identifier,
      position: { x: touch.startX, y: touch.startY },
      timestamp: performance.now(),
    });
  }

  #onTouchMove(touch: TouchData): void {
    if (touch.identifier !== this.#activeTouch) return;

    // Calculate position relative to center
    let deltaX = touch.currentX - this.#center.x;
    let deltaY = touch.currentY - this.#center.y;

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

    // Create move data
    const moveData: JoystickMoveData = {
      identifier: touch.identifier,
      position: {
        x: clamped.x / radius,
        y: clamped.y / radius,
      },
      rawPosition: clamped,
      force,
      distance,
      angle: angleData,
      direction: getDirection(angleData.degree),
      vector: normalizeVector(clamped.x, clamped.y),
      timestamp: performance.now(),
    };

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

  #onTouchEnd(touch: TouchData): void {
    if (touch.identifier !== this.#activeTouch) return;

    this.#activeTouch = null;
    this.#container?.classList.remove('active');

    // Reset nub position
    if (this.restJoystick) {
      this.#updateNubPosition({ x: 0, y: 0 });
    }

    // Hide container in dynamic mode
    if (this.mode === 'dynamic' && this.#container) {
      // Could add fade out animation here
    }

    // Emit end event
    this.#emitEvent<JoystickEndData>('joystick-end', {
      identifier: touch.identifier,
      timestamp: performance.now(),
    });
  }

  // =====================
  // Visual Updates
  // =====================

  #updateNubPosition(position: Point): void {
    if (!this.#nub || this.dataOnly) return;

    this.#nub.style.transform = `translate(
      calc(-50% + ${position.x}px),
      calc(-50% + ${position.y}px)
    )`;
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
        if (value !== null && !this.#container) {
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
