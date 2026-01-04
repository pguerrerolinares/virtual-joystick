/**
 * Typed event emitter utilities for Web Components.
 * Ensures CustomEvents cross Shadow DOM boundaries with `composed: true`.
 */

/**
 * Options for creating events.
 */
export interface EventOptions {
  /** Whether the event bubbles up through the DOM (default: true) */
  bubbles?: boolean;
  /** Whether the event can be cancelled (default: false) */
  cancelable?: boolean;
  /** Whether the event crosses Shadow DOM boundaries (default: true - CRITICAL) */
  composed?: boolean;
}

const DEFAULT_OPTIONS: EventOptions = {
  bubbles: true,
  cancelable: false,
  composed: true, // CRITICAL: Cross Shadow DOM boundary
};

/**
 * Create a typed CustomEvent with proper defaults for Web Components.
 * Always uses `composed: true` to ensure events cross Shadow DOM boundaries.
 *
 * @param name - Event name
 * @param detail - Event detail data
 * @param options - Optional event options
 * @returns CustomEvent ready to dispatch
 *
 * @example
 * ```typescript
 * const event = createEvent('joystick-move', { position, force });
 * this.dispatchEvent(event);
 * ```
 */
export function createEvent<T>(
  name: string,
  detail: T,
  options: EventOptions = {}
): CustomEvent<T> {
  return new CustomEvent(name, {
    detail,
    ...DEFAULT_OPTIONS,
    ...options,
  });
}

/**
 * Type-safe event dispatcher mixin for HTMLElement.
 * Use this to add strongly-typed emit methods to your components.
 *
 * @example
 * ```typescript
 * interface MyEvents {
 *   'my-event': { value: number };
 *   'other-event': { text: string };
 * }
 *
 * class MyElement extends HTMLElement {
 *   #emit = createTypedEmitter<MyEvents>(this);
 *
 *   someMethod() {
 *     this.#emit('my-event', { value: 42 });
 *   }
 * }
 * ```
 */
export function createTypedEmitter<TEvents extends Record<string, unknown>>(
  element: HTMLElement
): <K extends keyof TEvents>(name: K, detail: TEvents[K]) => boolean {
  return <K extends keyof TEvents>(name: K, detail: TEvents[K]) => {
    const event = createEvent(String(name), detail);
    return element.dispatchEvent(event);
  };
}

/**
 * Type helper for defining component events.
 *
 * @example
 * ```typescript
 * type JoystickEventMap = DefineEvents<{
 *   'joystick-start': JoystickStartData;
 *   'joystick-move': JoystickMoveData;
 *   'joystick-end': JoystickEndData;
 * }>;
 * ```
 */
export type DefineEvents<T extends Record<string, unknown>> = {
  [K in keyof T]: CustomEvent<T[K]>;
};

/**
 * Add typed event listener to an element.
 *
 * @example
 * ```typescript
 * addTypedListener(joystick, 'joystick-move', (e) => {
 *   console.log(e.detail.position); // Typed!
 * });
 * ```
 */
export function addTypedListener<
  TEvents extends Record<string, unknown>,
  K extends keyof TEvents
>(
  element: HTMLElement,
  eventName: K,
  handler: (event: CustomEvent<TEvents[K]>) => void,
  options?: AddEventListenerOptions
): () => void {
  const wrappedHandler = (e: Event) => {
    handler(e as CustomEvent<TEvents[K]>);
  };

  element.addEventListener(String(eventName), wrappedHandler, options);

  // Return cleanup function
  return () => {
    element.removeEventListener(String(eventName), wrappedHandler, options);
  };
}
