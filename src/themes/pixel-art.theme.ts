/**
 * Pixel Art theme - retro game aesthetic with detailed SVG sprites.
 */

import type { Theme, ThemeConfig } from './theme.interface';
import {
  PIXEL_PAD_SVG,
  PIXEL_NUB_SVG,
  PIXEL_BUTTON_RED_SVG,
  PIXEL_BUTTON_GREEN_SVG,
} from './sprites';

export const pixelArtTheme: Theme = {
  name: 'pixel-art',

  joystick: {
    pad: {
      type: 'image',
      image: PIXEL_PAD_SVG,
      imageRendering: 'pixelated',
    },
    nub: {
      type: 'image',
      sizeRatio: 0.5,
      image: PIXEL_NUB_SVG,
      imageRendering: 'pixelated',
    },
  },

  actionButton: {
    button: {
      type: 'image',
      image: PIXEL_BUTTON_RED_SVG,
      imageRendering: 'pixelated',
    },
  },

  chargeButton: {
    button: {
      type: 'image',
      image: PIXEL_BUTTON_GREEN_SVG,
      imageRendering: 'pixelated',
    },
    chargeRing: {
      strokeWidth: 6,
      trackColor: 'rgba(42, 42, 76, 0.5)',
      chargeColors: ['#4a8c4a', '#8c8c4a', '#8c4a4a'],
    },
  },

  animations: {
    fadeIn: 'pixelFadeIn 0.1s steps(3)',
    fadeOut: 'pixelFadeOut 0.1s steps(3)',
    press: 'pixelPress 0.05s steps(2)',
    release: 'pixelRelease 0.1s steps(2)',
  },
};

export const pixelArtThemeConfig: ThemeConfig = {
  theme: pixelArtTheme,
  cssVars: {
    '--vj-size': '96px',
    '--vj-color': '#5a5a8c',
    '--vj-rest-opacity': '0.8',
    '--vj-active-opacity': '1',
    '--vj-transition': '0s',
  },
};

/**
 * CSS for pixel-art theme - can be injected or used with adoptedStyleSheets
 */
export const pixelArtCSS = `
  /* Pixel Art Theme Styles */
  :host([theme="pixel-art"]) {
    --vj-transition: 0s;
  }

  :host([theme="pixel-art"]) .pad {
    background: url('${PIXEL_PAD_SVG}') center/contain no-repeat;
    border: none;
    box-shadow: none;
    border-radius: 0;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  :host([theme="pixel-art"]) .nub {
    background: url('${PIXEL_NUB_SVG}') center/contain no-repeat;
    border: none;
    box-shadow: none;
    border-radius: 0;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  :host([theme="pixel-art"]) .button {
    background: url('${PIXEL_BUTTON_RED_SVG}') center/contain no-repeat;
    border: none;
    box-shadow: none;
    border-radius: 0;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  /* Pixel animations */
  @keyframes pixelFadeIn {
    0% { opacity: 0; }
    33% { opacity: 0.3; }
    66% { opacity: 0.6; }
    100% { opacity: var(--vj-rest-opacity, 0.8); }
  }

  @keyframes pixelFadeOut {
    0% { opacity: var(--vj-rest-opacity, 0.8); }
    33% { opacity: 0.6; }
    66% { opacity: 0.3; }
    100% { opacity: 0; }
  }

  @keyframes pixelPress {
    0% { transform: scale(1); }
    100% { transform: scale(0.9); }
  }

  @keyframes pixelRelease {
    0% { transform: scale(0.9); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
