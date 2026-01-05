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

/**
 * Manages input tracking for touch, mouse, and pointer events.
 * Each input is tracked by its unique identifier.
 */
export class InputManager {
  /** Timeout for zombie touch cleanup (ms) - nipplejs #151 */
  static readonly ZOMBIE_TIMEOUT = 1000;

  // Singleton visibility handler
  static #visibilityInitialized = false;
  static #instances = new Set<InputManager>();

  static #initVisibilityHandler(): void {
    if (this.#visibilityInitialized || typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        for (const instance of this.#instances) {
          instance.releaseAll();
        }
      }
    });

    this.#visibilityInitialized = true;
  }

  readonly #inputs = new Map<number, InputData>();
  readonly #lastActivityTime = new Map<number, number>();
  #onStart?: InputCallback;
  #onMove?: InputCallback;
  #onEnd?: InputCallback;

  // Bound handlers for cleanup
  readonly #boundPointerMove = this.#handlePointerMove.bind(this);
  readonly #boundPointerUp = this.#handlePointerUp.bind(this);
  readonly #boundMouseMove = this.#handleMouseMove.bind(this);
  readonly #boundMouseUp = this.#handleMouseUp.bind(this);

  #pointerListenersAdded = false;
  #mouseListenersAdded = false;

  constructor() {
    InputManager.#instances.add(this);
    InputManager.#initVisibilityHandler();
  }

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
    this.#lastActivityTime.set(event.pointerId, Date.now());
    this.#addDocumentListeners('pointer');
    this.#onStart?.(data);
  }

  #handlePointerMove(event: PointerEvent): void {
    const data = this.#inputs.get(event.pointerId);
    if (data) {
      data.currentX = event.clientX;
      data.currentY = event.clientY;
      this.#lastActivityTime.set(event.pointerId, Date.now());
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
      this.#lastActivityTime.delete(event.pointerId);
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
      this.#lastActivityTime.set(touch.identifier, Date.now());
      this.#onStart?.(data);
    }
  }

  handleTouchMove(event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      const data = this.#inputs.get(touch.identifier);
      if (data) {
        data.currentX = touch.clientX;
        data.currentY = touch.clientY;
        this.#lastActivityTime.set(touch.identifier, Date.now());
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
        this.#lastActivityTime.delete(touch.identifier);
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
    this.#lastActivityTime.set(0, Date.now());
    this.#addDocumentListeners('mouse');
    this.#onStart?.(data);
  }

  #handleMouseMove(event: MouseEvent): void {
    const data = this.#inputs.get(0);
    if (data) {
      data.currentX = event.clientX;
      data.currentY = event.clientY;
      this.#lastActivityTime.set(0, Date.now());
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
      this.#lastActivityTime.delete(0);
    }
    this.#removeDocumentListeners('mouse');
  }

  // =====================
  // Document listeners
  // =====================

  #addDocumentListeners(type: 'pointer' | 'mouse'): void {
    if (type === 'pointer') {
      if (this.#pointerListenersAdded) return;
      document.addEventListener('pointermove', this.#boundPointerMove);
      document.addEventListener('pointerup', this.#boundPointerUp);
      document.addEventListener('pointercancel', this.#boundPointerUp);
      this.#pointerListenersAdded = true;
    } else {
      if (this.#mouseListenersAdded) return;
      document.addEventListener('mousemove', this.#boundMouseMove);
      document.addEventListener('mouseup', this.#boundMouseUp);
      this.#mouseListenersAdded = true;
    }
  }

  #removeDocumentListeners(type: 'pointer' | 'mouse'): void {
    if (type === 'pointer') {
      if (!this.#pointerListenersAdded) return;
      document.removeEventListener('pointermove', this.#boundPointerMove);
      document.removeEventListener('pointerup', this.#boundPointerUp);
      document.removeEventListener('pointercancel', this.#boundPointerUp);
      this.#pointerListenersAdded = false;
    } else {
      if (!this.#mouseListenersAdded) return;
      document.removeEventListener('mousemove', this.#boundMouseMove);
      document.removeEventListener('mouseup', this.#boundMouseUp);
      this.#mouseListenersAdded = false;
    }
  }

  // =====================
  // Utility
  // =====================

  /**
   * Release a specific input by identifier.
   */
  release(identifier: number): void {
    const data = this.#inputs.get(identifier);
    if (data) {
      this.#onEnd?.(data);
      this.#inputs.delete(identifier);
      this.#lastActivityTime.delete(identifier);
    }

    if (this.#inputs.size === 0) {
      this.#removeDocumentListeners('pointer');
      this.#removeDocumentListeners('mouse');
    }
  }

  /**
   * Release all active inputs.
   */
  releaseAll(): void {
    for (const [, data] of this.#inputs) {
      this.#onEnd?.(data);
    }
    this.#inputs.clear();
    this.#lastActivityTime.clear();
    this.#removeDocumentListeners('pointer');
    this.#removeDocumentListeners('mouse');
  }

  /**
   * Check for and release zombie inputs (no activity for ZOMBIE_TIMEOUT ms).
   * Call this periodically (e.g., in RAF loop) to clean up stuck inputs.
   * Fixes nipplejs #151 - dynamic joysticks freeze on fast interaction.
   */
  checkZombies(): void {
    const now = Date.now();
    for (const [id, lastTime] of this.#lastActivityTime) {
      if (now - lastTime > InputManager.ZOMBIE_TIMEOUT) {
        this.release(id);
      }
    }
  }

  /**
   * Clear all inputs without triggering callbacks.
   */
  clear(): void {
    this.#inputs.clear();
    this.#lastActivityTime.clear();
    this.#removeDocumentListeners('pointer');
    this.#removeDocumentListeners('mouse');
  }

  /**
   * Remove all callbacks and cleanup.
   */
  destroy(): void {
    InputManager.#instances.delete(this);
    this.#onStart = undefined;
    this.#onMove = undefined;
    this.#onEnd = undefined;
    this.#inputs.clear();
    this.#lastActivityTime.clear();
    this.#removeDocumentListeners('pointer');
    this.#removeDocumentListeners('mouse');
  }
}
