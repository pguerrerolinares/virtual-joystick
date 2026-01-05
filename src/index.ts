// Components
import { VirtualJoystickElement } from './components/joystick/joystick.element';
import { VirtualActionButtonElement } from './components/action-button/action-button.element';

export { VirtualJoystickElement, VirtualActionButtonElement };

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
  ActionButtonTheme,
  ActionButtonOptions,
  ActionButtonPressData,
  ActionButtonReleaseData,
} from './components/action-button/action-button.types';

// Core utilities
export { getLocalPosition } from './core/transform-utils';
export {
  clampToCircle,
  clampToSquare,
  normalizeVector,
  getCompassDirection,
  type CompassDirection,
} from './core/math-utils';

// Themes
export type { Theme, ThemeConfig } from './themes/theme.interface';
export { modernTheme, modernThemeConfig } from './themes/modern.theme';

// Registration helper
export function registerAll(): void {
  VirtualJoystickElement.register();
  VirtualActionButtonElement.register();
}
