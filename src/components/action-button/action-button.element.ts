/**
 * Virtual Action Button Web Component.
 *
 * @example
 * ```html
 * <virtual-action-button icon="jump"></virtual-action-button>
 * ```
 */

import { styles } from './action-button.styles';
import type {
  ActionButtonTheme,
  ActionButtonPressData,
  ActionButtonReleaseData,
} from './action-button.types';

/** Feature detection */
const supportsPointer =
  typeof window !== 'undefined' && 'PointerEvent' in window;

export class VirtualActionButtonElement extends HTMLElement {
  static tagName = 'virtual-action-button';

  static get observedAttributes(): string[] {
    return ['theme', 'size', 'icon'];
  }

  readonly #shadow: ShadowRoot;

  #button: HTMLDivElement | null = null;
  #pressStartTime: number | null = null;
  #activeInput: number | null = null;

  readonly #boundPointerDown = this.#handlePointerDown.bind(this);
  readonly #boundPointerUp = this.#handlePointerUp.bind(this);
  readonly #boundTouchStart = this.#handleTouchStart.bind(this);
  readonly #boundTouchEnd = this.#handleTouchEnd.bind(this);
  readonly #boundMouseDown = this.#handleMouseDown.bind(this);
  readonly #boundMouseUp = this.#handleMouseUp.bind(this);

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.adoptedStyleSheets = [styles];
  }

  // =====================
  // Attribute getters/setters
  // =====================

  get theme(): ActionButtonTheme {
    return (this.getAttribute('theme') as ActionButtonTheme) || 'modern';
  }
  set theme(value: ActionButtonTheme) {
    this.setAttribute('theme', value);
  }

  get size(): number {
    return parseInt(this.getAttribute('size') || '64', 10);
  }
  set size(value: number) {
    this.setAttribute('size', String(value));
  }

  get icon(): string {
    return this.getAttribute('icon') || '';
  }
  set icon(value: string) {
    this.setAttribute('icon', value);
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
    this.#shadow.innerHTML = `
      <div class="button" role="button" tabindex="0">
        <slot></slot>
      </div>
    `;

    this.#button = this.#shadow.querySelector('.button');
    this.#updateSize();
  }

  #updateSize(): void {
    if (this.#button) {
      this.#button.style.setProperty('--vab-size', `${this.size}px`);
    }
  }

  // =====================
  // Event Listeners
  // =====================

  #setupEventListeners(): void {
    if (supportsPointer) {
      // Pointer Events (handles touch + mouse + pen)
      this.addEventListener('pointerdown', this.#boundPointerDown);
      document.addEventListener('pointerup', this.#boundPointerUp);
      document.addEventListener('pointercancel', this.#boundPointerUp);
    } else {
      // Fallback: Touch + Mouse events
      this.addEventListener('touchstart', this.#boundTouchStart, {
        passive: false,
      });
      this.addEventListener('touchend', this.#boundTouchEnd);
      this.addEventListener('touchcancel', this.#boundTouchEnd);

      // Mouse events for desktop
      this.addEventListener('mousedown', this.#boundMouseDown);
      document.addEventListener('mouseup', this.#boundMouseUp);
    }
  }

  #cleanup(): void {
    // Remove Pointer events
    this.removeEventListener('pointerdown', this.#boundPointerDown);
    document.removeEventListener('pointerup', this.#boundPointerUp);
    document.removeEventListener('pointercancel', this.#boundPointerUp);

    // Remove Touch events
    this.removeEventListener('touchstart', this.#boundTouchStart);
    this.removeEventListener('touchend', this.#boundTouchEnd);
    this.removeEventListener('touchcancel', this.#boundTouchEnd);

    // Remove Mouse events
    this.removeEventListener('mousedown', this.#boundMouseDown);
    document.removeEventListener('mouseup', this.#boundMouseUp);
  }

  // =====================
  // Pointer Handlers
  // =====================

  #handlePointerDown(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.#activeInput !== null) return;

    this.#activeInput = event.pointerId;
    this.#pressStartTime = performance.now();

    this.#button?.classList.add('pressed');

    this.#emitEvent<ActionButtonPressData>('button-press', {
      timestamp: this.#pressStartTime,
    });
  }

  #handlePointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.#activeInput) return;

    this.#release();
  }

  // =====================
  // Touch Handlers
  // =====================

  #handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.#activeInput !== null) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    this.#activeInput = touch.identifier;
    this.#pressStartTime = performance.now();

    this.#button?.classList.add('pressed');

    this.#emitEvent<ActionButtonPressData>('button-press', {
      timestamp: this.#pressStartTime,
    });
  }

  #handleTouchEnd(event: TouchEvent): void {
    // Find the touch that ended
    for (const touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.#activeInput) {
        this.#release();
        break;
      }
    }
  }

  // =====================
  // Mouse Handlers
  // =====================

  #handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.#activeInput !== null) return;

    this.#activeInput = 0; // Mouse always uses identifier 0
    this.#pressStartTime = performance.now();

    this.#button?.classList.add('pressed');

    this.#emitEvent<ActionButtonPressData>('button-press', {
      timestamp: this.#pressStartTime,
    });
  }

  #handleMouseUp(_event: MouseEvent): void {
    if (this.#activeInput !== 0) return;

    this.#release();
  }

  // =====================
  // Release Helper
  // =====================

  #release(): void {
    const endTime = performance.now();
    const duration = this.#pressStartTime
      ? endTime - this.#pressStartTime
      : 0;

    this.#button?.classList.remove('pressed');

    this.#emitEvent<ActionButtonReleaseData>('button-release', {
      timestamp: endTime,
      duration,
    });

    this.#activeInput = null;
    this.#pressStartTime = null;
  }

  // =====================
  // Event Emission
  // =====================

  #emitEvent<T>(name: string, detail: T): void {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  // =====================
  // Attribute Changes
  // =====================

  #handleAttributeChange(name: string, _value: string | null): void {
    switch (name) {
      case 'size':
        this.#updateSize();
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
