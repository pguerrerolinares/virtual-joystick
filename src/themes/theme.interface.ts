/**
 * Theme system for virtual-joystick components.
 */

export interface ThemeStyle {
  type: 'css' | 'image';
  /** CSS properties when type is 'css' */
  css?: {
    background?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
  };
  /** Image URL or data URI when type is 'image' */
  image?: string;
  /** Image rendering mode */
  imageRendering?: 'auto' | 'pixelated' | 'crisp-edges';
}

export interface ThemeAnimations {
  fadeIn?: string;
  fadeOut?: string;
  press?: string;
  release?: string;
}

export interface JoystickThemeConfig {
  pad: ThemeStyle;
  nub: ThemeStyle & {
    /** Nub size as ratio of pad size (0-1) */
    sizeRatio: number;
  };
}

export interface ButtonThemeConfig {
  button: ThemeStyle;
  icon?: ThemeStyle;
}

export interface Theme {
  name: string;
  joystick: JoystickThemeConfig;
  actionButton: ButtonThemeConfig;
  animations: ThemeAnimations;
}

export interface ThemeConfig {
  theme: Theme;
  /** CSS custom properties to inject */
  cssVars?: Record<string, string>;
}

