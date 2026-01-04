/**
 * Virtual Charge Button Web Component.
 * Hold to charge, release to activate.
 *
 * @example
 * ```html
 * <virtual-charge-button
 *   charge-time="800"
 *   show-percentage
 * ></virtual-charge-button>
 * ```
 */

import { styles } from './charge-button.styles';
import type {
  ChargeButtonTheme,
  ChargeStartData,
  ChargeUpdateData,
  ChargeReleaseData,
} from './charge-button.types';

/** Feature detection */
const supportsPointer =
  typeof window !== 'undefined' && 'PointerEvent' in window;

export class VirtualChargeButtonElement extends HTMLElement {
  static tagName = 'virtual-charge-button';

  static get observedAttributes(): string[] {
    return ['theme', 'size', 'charge-time', 'show-percentage', 'min-charge'];
  }

  readonly #shadow: ShadowRoot;

  #container: HTMLDivElement | null = null;
  #button: HTMLDivElement | null = null;
  #ringProgress: SVGCircleElement | null = null;
  #percentText: HTMLSpanElement | null = null;

  // State
  #activeInput: number | null = null;
  #chargeStartTime: number | null = null;
  #currentPercent = 0;
  #animationFrameId: number | null = null;
  #ringCircumference = 0;

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

  get theme(): ChargeButtonTheme {
    return (this.getAttribute('theme') as ChargeButtonTheme) || 'modern';
  }
  set theme(value: ChargeButtonTheme) {
    this.setAttribute('theme', value);
  }

  get size(): number {
    return parseInt(this.getAttribute('size') || '64', 10);
  }
  set size(value: number) {
    this.setAttribute('size', String(value));
  }

  get chargeTime(): number {
    return parseInt(this.getAttribute('charge-time') || '800', 10);
  }
  set chargeTime(value: number) {
    this.setAttribute('charge-time', String(value));
  }

  get showPercentage(): boolean {
    return this.hasAttribute('show-percentage');
  }
  set showPercentage(value: boolean) {
    this.toggleAttribute('show-percentage', value);
  }

  get minCharge(): number {
    return parseFloat(this.getAttribute('min-charge') || '0');
  }
  set minCharge(value: number) {
    this.setAttribute('min-charge', String(value));
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
    // Ring surrounds the button with padding
    const ringStrokeWidth = 4;
    const ringPadding = 4; // Gap between button edge and ring
    const ringRadius = (this.size / 2) + ringPadding;
    const ringSize = (ringRadius + ringStrokeWidth / 2) * 2;
    this.#ringCircumference = 2 * Math.PI * ringRadius;

    this.#shadow.innerHTML = `
      <div class="container">
        <div class="button" role="button" tabindex="0">
          <span class="percent">0%</span>
          <slot></slot>
        </div>
        <div class="ring-container" style="--ring-offset: ${ringPadding + ringStrokeWidth / 2}px">
          <svg class="ring-svg" viewBox="0 0 ${ringSize} ${ringSize}">
            <circle
              class="ring-track"
              cx="${ringSize / 2}"
              cy="${ringSize / 2}"
              r="${ringRadius}"
            />
            <circle
              class="ring-progress"
              cx="${ringSize / 2}"
              cy="${ringSize / 2}"
              r="${ringRadius}"
              stroke-dasharray="${this.#ringCircumference}"
              stroke-dashoffset="${this.#ringCircumference}"
            />
          </svg>
        </div>
      </div>
    `;

    this.#container = this.#shadow.querySelector('.container');
    this.#button = this.#shadow.querySelector('.button');
    this.#ringProgress = this.#shadow.querySelector('.ring-progress');
    this.#percentText = this.#shadow.querySelector('.percent');

    this.#updateSize();
  }

  #updateSize(): void {
    if (this.#container) {
      this.#container.style.setProperty('--vcb-size', `${this.size}px`);
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

    if (this.#animationFrameId !== null) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }
  }

  // =====================
  // Pointer Handlers
  // =====================

  #handlePointerDown(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.#activeInput !== null) return;

    this.#activeInput = event.pointerId;
    this.#startCharge();
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
    this.#startCharge();
  }

  #handleTouchEnd(event: TouchEvent): void {
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
    this.#startCharge();
  }

  #handleMouseUp(_event: MouseEvent): void {
    if (this.#activeInput !== 0) return;

    this.#release();
  }

  // =====================
  // Charge Start/Release Helpers
  // =====================

  #startCharge(): void {
    this.#chargeStartTime = performance.now();
    this.#currentPercent = 0;

    this.#button?.classList.add('pressed');

    this.#emitEvent<ChargeStartData>('charge-start', {
      timestamp: this.#chargeStartTime,
    });

    // Start charge loop
    this.#updateCharge();
  }

  #release(): void {
    const endTime = performance.now();
    const duration = this.#chargeStartTime
      ? endTime - this.#chargeStartTime
      : 0;

    // Stop animation loop
    if (this.#animationFrameId !== null) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }

    this.#button?.classList.remove('pressed', 'fully-charged');

    // Emit release event
    this.#emitEvent<ChargeReleaseData>('charge-release', {
      percent: this.#currentPercent,
      activated: this.#currentPercent >= this.minCharge,
      duration,
      timestamp: endTime,
    });

    // Reset visual state
    this.#updateVisual(0, this.#getChargeColor(0));

    this.#activeInput = null;
    this.#chargeStartTime = null;
    this.#currentPercent = 0;
  }

  // =====================
  // Charge Logic
  // =====================

  #updateCharge(): void {
    if (this.#chargeStartTime === null) return;

    const elapsed = performance.now() - this.#chargeStartTime;
    const percent = Math.min((elapsed / this.chargeTime) * 100, 100);

    this.#currentPercent = percent;

    const color = this.#getChargeColor(percent);

    // Update visuals
    this.#updateVisual(percent, color);

    // Emit update event
    this.#emitEvent<ChargeUpdateData>('charge-update', {
      percent,
      color,
      timestamp: performance.now(),
    });

    // Add fully-charged class for pulse animation
    if (percent >= 100) {
      this.#button?.classList.add('fully-charged');
    }

    // Continue loop if still charging
    if (this.#activeInput !== null) {
      this.#animationFrameId = requestAnimationFrame(() => this.#updateCharge());
    }
  }

  #updateVisual(percent: number, color: string): void {
    // Update ring
    if (this.#ringProgress) {
      const offset =
        this.#ringCircumference - (percent / 100) * this.#ringCircumference;
      this.#ringProgress.style.strokeDashoffset = String(offset);
      this.#ringProgress.style.stroke = color;
    }

    // Update percent text
    if (this.#percentText) {
      this.#percentText.textContent = `${Math.round(percent)}%`;
    }
  }

  /**
   * Get charge color using HSL interpolation.
   * Green (120°) → Yellow (60°) at 65% → Red (0°) at 90%+
   */
  #getChargeColor(percent: number): string {
    let hue: number;

    if (percent < 65) {
      // Green to Yellow: 120° → 60°
      hue = 120 - (percent / 65) * 60;
    } else if (percent < 90) {
      // Yellow to Red: 60° → 0°
      hue = 60 - ((percent - 65) / 25) * 60;
    } else {
      // Red
      hue = 0;
    }

    return `hsl(${hue}, 80%, 50%)`;
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
        // Re-render to update SVG dimensions
        if (this.isConnected) {
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
