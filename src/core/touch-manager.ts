/**
 * Multi-touch tracking manager.
 * Fixes nipplejs #231, #189 - multi-touch conflicts on Firefox Android.
 */

export interface TouchData {
  identifier: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
}

export type TouchCallback = (touch: TouchData) => void;

/**
 * Manages multi-touch tracking with proper cleanup.
 * Each touch is tracked by its unique identifier.
 */
export class TouchManager {
  readonly #touches = new Map<number, TouchData>();
  #onStart?: TouchCallback;
  #onMove?: TouchCallback;
  #onEnd?: TouchCallback;

  /**
   * Get all active touches.
   */
  get activeTouches(): ReadonlyMap<number, TouchData> {
    return this.#touches;
  }

  /**
   * Get touch by identifier.
   */
  getTouch(identifier: number): TouchData | undefined {
    return this.#touches.get(identifier);
  }

  /**
   * Check if a touch is being tracked.
   */
  hasTouch(identifier: number): boolean {
    return this.#touches.has(identifier);
  }

  /**
   * Set callback for touch start.
   */
  onStart(callback: TouchCallback): this {
    this.#onStart = callback;
    return this;
  }

  /**
   * Set callback for touch move.
   */
  onMove(callback: TouchCallback): this {
    this.#onMove = callback;
    return this;
  }

  /**
   * Set callback for touch end.
   */
  onEnd(callback: TouchCallback): this {
    this.#onEnd = callback;
    return this;
  }

  /**
   * Handle touchstart event.
   * Processes ALL changedTouches, not just the first one.
   */
  handleTouchStart(event: TouchEvent): void {
    // CRITICAL: Process changedTouches, not touches
    for (const touch of Array.from(event.changedTouches)) {
      const data: TouchData = {
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: performance.now(),
      };

      this.#touches.set(touch.identifier, data);
      this.#onStart?.(data);
    }
  }

  /**
   * Handle touchmove event.
   * Updates position for ALL changedTouches.
   */
  handleTouchMove(event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      const data = this.#touches.get(touch.identifier);
      if (data) {
        data.currentX = touch.clientX;
        data.currentY = touch.clientY;
        this.#onMove?.(data);
      }
    }
  }

  /**
   * Handle touchend event.
   * CRITICAL: Only removes touches that actually ended (changedTouches).
   * Does NOT call preventDefault() - fixes Firefox Android bugs (#231, #189).
   */
  handleTouchEnd(event: TouchEvent): void {
    // CRITICAL: Only process changedTouches, not all touches
    for (const touch of Array.from(event.changedTouches)) {
      const data = this.#touches.get(touch.identifier);
      if (data) {
        // Update final position
        data.currentX = touch.clientX;
        data.currentY = touch.clientY;

        this.#onEnd?.(data);
        this.#touches.delete(touch.identifier);
      }
    }
    // NOTE: Do NOT call event.preventDefault() here - causes bugs on Firefox Android
  }

  /**
   * Handle touchcancel event.
   * Treats cancelled touches as ended.
   */
  handleTouchCancel(event: TouchEvent): void {
    this.handleTouchEnd(event);
  }

  /**
   * Release all active touches.
   * Useful for visibility change handling.
   */
  releaseAll(): void {
    for (const [, data] of this.#touches) {
      this.#onEnd?.(data);
    }
    this.#touches.clear();
  }

  /**
   * Clear all touches without triggering callbacks.
   */
  clear(): void {
    this.#touches.clear();
  }

  /**
   * Remove all callbacks.
   */
  destroy(): void {
    this.#onStart = undefined;
    this.#onMove = undefined;
    this.#onEnd = undefined;
    this.#touches.clear();
  }
}
