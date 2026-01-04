/**
 * Unified input manager for touch, mouse, and pointer events.
 * Provides consistent interface across desktop and mobile.
 *
 * Priority:
 * 1. PointerEvent (modern, handles touch + mouse + pen)
 * 2. TouchEvent + MouseEvent (fallback for older browsers)
 */

export interface InputData {
  identifier: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  inputType: 'touch' | 'mouse' | 'pointer';
}

export type InputCallback = (input: InputData) => void;

/** Feature detection */
const supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window;
const supportsTouch = typeof window !== 'undefined' && 'ontouchstart' in window;

/**
 * Manages input tracking for touch, mouse, and pointer events.
 * Each input is tracked by its unique identifier.
 */
export class InputManager {
  readonly #inputs = new Map<number, InputData>();
  #onStart?: InputCallback;
  #onMove?: InputCallback;
  #onEnd?: InputCallback;

  // Bound handlers for cleanup
  readonly #boundPointerMove = this.#handlePointerMove.bind(this);
  readonly #boundPointerUp = this.#handlePointerUp.bind(this);
  readonly #boundMouseMove = this.#handleMouseMove.bind(this);
  readonly #boundMouseUp = this.#handleMouseUp.bind(this);

  #documentListenersAdded = false;

  /**
   * Get all active inputs.
   */
  get activeInputs(): ReadonlyMap<number, InputData> {
    return this.#inputs;
  }

  /**
   * Get input by identifier.
   */
  getInput(identifier: number): InputData | undefined {
    return this.#inputs.get(identifier);
  }

  /**
   * Check if an input is being tracked.
   */
  hasInput(identifier: number): boolean {
    return this.#inputs.has(identifier);
  }

  /**
   * Set callback for input start.
   */
  onStart(callback: InputCallback): this {
    this.#onStart = callback;
    return this;
  }

  /**
   * Set callback for input move.
   */
  onMove(callback: InputCallback): this {
    this.#onMove = callback;
    return this;
  }

  /**
   * Set callback for input end.
   */
  onEnd(callback: InputCallback): this {
    this.#onEnd = callback;
    return this;
  }

  /**
   * Returns true if Pointer Events are supported.
   */
  static get supportsPointer(): boolean {
    return supportsPointer;
  }

  /**
   * Returns true if Touch Events are supported.
   */
  static get supportsTouch(): boolean {
    return supportsTouch;
  }

  // =====================
  // Pointer Events
  // =====================

  handlePointerDown(event: PointerEvent): void {
    const data: InputData = {
      identifier: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startTime: performance.now(),
      inputType: 'pointer',
    };

    this.#inputs.set(event.pointerId, data);
    this.#addDocumentListeners('pointer');
    this.#onStart?.(data);
  }

  #handlePointerMove(event: PointerEvent): void {
    const data = this.#inputs.get(event.pointerId);
    if (data) {
      data.currentX = event.clientX;
      data.currentY = event.clientY;
      this.#onMove?.(data);
    }
  }

  #handlePointerUp(event: PointerEvent): void {
    const data = this.#inputs.get(event.pointerId);
    if (data) {
      data.currentX = event.clientX;
      data.currentY = event.clientY;
      this.#onEnd?.(data);
      this.#inputs.delete(event.pointerId);
    }

    if (this.#inputs.size === 0) {
      this.#removeDocumentListeners('pointer');
    }
  }

  // =====================
  // Touch Events
  // =====================

  handleTouchStart(event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      const data: InputData = {
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: performance.now(),
        inputType: 'touch',
      };

      this.#inputs.set(touch.identifier, data);
      this.#onStart?.(data);
    }
  }

  handleTouchMove(event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      const data = this.#inputs.get(touch.identifier);
      if (data) {
        data.currentX = touch.clientX;
        data.currentY = touch.clientY;
        this.#onMove?.(data);
      }
    }
  }

  handleTouchEnd(event: TouchEvent): void {
    // CRITICAL: Only process changedTouches
    // Do NOT call preventDefault() - causes bugs on Firefox Android (#231, #189)
    for (const touch of Array.from(event.changedTouches)) {
      const data = this.#inputs.get(touch.identifier);
      if (data) {
        data.currentX = touch.clientX;
        data.currentY = touch.clientY;
        this.#onEnd?.(data);
        this.#inputs.delete(touch.identifier);
      }
    }
  }

  // =====================
  // Mouse Events (fallback)
  // =====================

  handleMouseDown(event: MouseEvent): void {
    // Mouse always uses identifier 0
    const data: InputData = {
      identifier: 0,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startTime: performance.now(),
      inputType: 'mouse',
    };

    this.#inputs.set(0, data);
    this.#addDocumentListeners('mouse');
    this.#onStart?.(data);
  }

  #handleMouseMove(event: MouseEvent): void {
    const data = this.#inputs.get(0);
    if (data) {
      data.currentX = event.clientX;
      data.currentY = event.clientY;
      this.#onMove?.(data);
    }
  }

  #handleMouseUp(event: MouseEvent): void {
    const data = this.#inputs.get(0);
    if (data) {
      data.currentX = event.clientX;
      data.currentY = event.clientY;
      this.#onEnd?.(data);
      this.#inputs.delete(0);
    }
    this.#removeDocumentListeners('mouse');
  }

  // =====================
  // Document listeners
  // =====================

  #addDocumentListeners(type: 'pointer' | 'mouse'): void {
    if (this.#documentListenersAdded) return;

    if (type === 'pointer') {
      document.addEventListener('pointermove', this.#boundPointerMove);
      document.addEventListener('pointerup', this.#boundPointerUp);
      document.addEventListener('pointercancel', this.#boundPointerUp);
    } else {
      document.addEventListener('mousemove', this.#boundMouseMove);
      document.addEventListener('mouseup', this.#boundMouseUp);
    }

    this.#documentListenersAdded = true;
  }

  #removeDocumentListeners(type: 'pointer' | 'mouse'): void {
    if (!this.#documentListenersAdded) return;

    if (type === 'pointer') {
      document.removeEventListener('pointermove', this.#boundPointerMove);
      document.removeEventListener('pointerup', this.#boundPointerUp);
      document.removeEventListener('pointercancel', this.#boundPointerUp);
    } else {
      document.removeEventListener('mousemove', this.#boundMouseMove);
      document.removeEventListener('mouseup', this.#boundMouseUp);
    }

    this.#documentListenersAdded = false;
  }

  // =====================
  // Utility
  // =====================

  /**
   * Release all active inputs.
   */
  releaseAll(): void {
    for (const [, data] of this.#inputs) {
      this.#onEnd?.(data);
    }
    this.#inputs.clear();
    this.#removeDocumentListeners('pointer');
    this.#removeDocumentListeners('mouse');
  }

  /**
   * Clear all inputs without triggering callbacks.
   */
  clear(): void {
    this.#inputs.clear();
    this.#removeDocumentListeners('pointer');
    this.#removeDocumentListeners('mouse');
  }

  /**
   * Remove all callbacks and cleanup.
   */
  destroy(): void {
    this.#onStart = undefined;
    this.#onMove = undefined;
    this.#onEnd = undefined;
    this.#inputs.clear();
    this.#removeDocumentListeners('pointer');
    this.#removeDocumentListeners('mouse');
  }
}
