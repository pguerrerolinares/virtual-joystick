// Components
import { VirtualJoystickElement } from './components/joystick/joystick.element';
import { VirtualActionButtonElement } from './components/action-button/action-button.element';
import { VirtualChargeButtonElement } from './components/charge-button/charge-button.element';

export { VirtualJoystickElement, VirtualActionButtonElement, VirtualChargeButtonElement };

// Types
export type {
  JoystickMode,
  JoystickShape,
  JoystickTheme,
  JoystickOptions,
  JoystickMoveData,
  JoystickStartData,
  JoystickEndData,
} from './components/joystick/joystick.types';

export type {
  ActionButtonOptions,
  ActionButtonPressData,
} from './components/action-button/action-button.types';

export type {
  ChargeButtonOptions,
  ChargeUpdateData,
} from './components/charge-button/charge-button.types';

// Core utilities
export { TouchManager } from './core/touch-manager';
export { getLocalPosition } from './core/transform-utils';
export {
  distance,
  angle,
  clampToCircle,
  clampToSquare,
  normalizeVector,
  getDirection,
} from './core/math-utils';
export {
  createEvent,
  createTypedEmitter,
  addTypedListener,
  type DefineEvents,
  type EventOptions,
} from './core/event-emitter';

// Themes
export type { Theme, ThemeConfig } from './themes/theme.interface';
export { modernTheme, modernThemeConfig } from './themes/modern.theme';
export { pixelArtTheme, pixelArtThemeConfig, pixelArtCSS } from './themes/pixel-art.theme';
export {
  PIXEL_PAD_SVG,
  PIXEL_PAD_SIMPLE_SVG,
  PIXEL_NUB_SVG,
  PIXEL_NUB_SIMPLE_SVG,
  PIXEL_BUTTON_RED_SVG,
  PIXEL_BUTTON_GREEN_SVG,
} from './themes/sprites';

// Registration helper
export function registerAll(): void {
  VirtualJoystickElement.register();
  VirtualActionButtonElement.register();
  VirtualChargeButtonElement.register();
}
