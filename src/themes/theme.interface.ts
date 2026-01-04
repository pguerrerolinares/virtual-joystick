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
  /** Charge ring style for charge buttons */
  chargeRing?: {
    strokeWidth: number;
    trackColor: string;
    /** Gradient colors from 0% to 100% charge */
    chargeColors: [string, string, string]; // start, mid, end
  };
}

export interface Theme {
  name: string;
  joystick: JoystickThemeConfig;
  actionButton: ButtonThemeConfig;
  chargeButton: ButtonThemeConfig;
  animations: ThemeAnimations;
}

export interface ThemeConfig {
  theme: Theme;
  /** CSS custom properties to inject */
  cssVars?: Record<string, string>;
}

/**
 * Create CSS from theme config.
 */
export function themeToCSS(config: ThemeConfig): string {
  const { theme, cssVars = {} } = config;

  const vars = Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n    ');

  const padStyle = theme.joystick.pad;
  const nubStyle = theme.joystick.nub;

  let css = `:host {\n    ${vars}\n  }\n\n`;

  // Pad styles
  if (padStyle.type === 'css' && padStyle.css) {
    css += `.pad {
    background: ${padStyle.css.background || 'rgba(255,255,255,0.1)'};
    border: ${padStyle.css.border || 'none'};
    border-radius: ${padStyle.css.borderRadius || '50%'};
    box-shadow: ${padStyle.css.boxShadow || 'none'};
  }\n\n`;
  } else if (padStyle.type === 'image' && padStyle.image) {
    css += `.pad {
    background: url('${padStyle.image}') center/contain no-repeat;
    image-rendering: ${padStyle.imageRendering || 'auto'};
  }\n\n`;
  }

  // Nub styles
  if (nubStyle.type === 'css' && nubStyle.css) {
    css += `.nub {
    background: ${nubStyle.css.background || '#4a90d9'};
    border: ${nubStyle.css.border || 'none'};
    border-radius: ${nubStyle.css.borderRadius || '50%'};
    box-shadow: ${nubStyle.css.boxShadow || 'none'};
  }\n`;
  } else if (nubStyle.type === 'image' && nubStyle.image) {
    css += `.nub {
    background: url('${nubStyle.image}') center/contain no-repeat;
    image-rendering: ${nubStyle.imageRendering || 'auto'};
  }\n`;
  }

  return css;
}
