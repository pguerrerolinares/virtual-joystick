/**
 * Auto-registration module.
 * Import this module to automatically register all virtual-joystick components.
 *
 * @example
 * ```typescript
 * // Auto-register all components
 * import 'virtual-joystick/register';
 *
 * // Then use in HTML
 * // <virtual-joystick></virtual-joystick>
 * ```
 */

import { registerAll } from './index';

// Only register in browser environment (SSR-safe)
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  registerAll();
}
