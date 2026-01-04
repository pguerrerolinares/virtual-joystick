/**
 * Pixel Art theme - retro game aesthetic.
 */

import type { Theme, ThemeConfig } from './theme.interface';

// Base64 encoded simple pixel art sprites
// These are placeholder patterns - can be replaced with actual sprites
const PIXEL_PAD_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x="4" y="0" width="24" height="4" fill="#3a3a5c"/>
  <rect x="0" y="4" width="4" height="24" fill="#3a3a5c"/>
  <rect x="28" y="4" width="4" height="24" fill="#3a3a5c"/>
  <rect x="4" y="28" width="24" height="4" fill="#3a3a5c"/>
  <rect x="4" y="4" width="24" height="24" fill="#2a2a4c"/>
  <rect x="8" y="8" width="16" height="16" fill="#1a1a3c"/>
</svg>
`)}`;

const PIXEL_NUB_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <rect x="4" y="0" width="8" height="4" fill="#6a6a9c"/>
  <rect x="0" y="4" width="4" height="8" fill="#6a6a9c"/>
  <rect x="12" y="4" width="4" height="8" fill="#4a4a7c"/>
  <rect x="4" y="12" width="8" height="4" fill="#4a4a7c"/>
  <rect x="4" y="4" width="8" height="8" fill="#5a5a8c"/>
</svg>
`)}`;

const PIXEL_BUTTON_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <rect x="4" y="0" width="8" height="4" fill="#9c6a6a"/>
  <rect x="0" y="4" width="4" height="8" fill="#9c6a6a"/>
  <rect x="12" y="4" width="4" height="8" fill="#7c4a4a"/>
  <rect x="4" y="12" width="8" height="4" fill="#7c4a4a"/>
  <rect x="4" y="4" width="8" height="8" fill="#8c5a5a"/>
</svg>
`)}`;

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
      image: PIXEL_BUTTON_SVG,
      imageRendering: 'pixelated',
    },
  },

  chargeButton: {
    button: {
      type: 'image',
      image: PIXEL_BUTTON_SVG,
      imageRendering: 'pixelated',
    },
    chargeRing: {
      strokeWidth: 6,
      trackColor: 'rgba(58, 58, 92, 0.5)',
      chargeColors: ['#6a9c6a', '#9c9c6a', '#9c6a6a'],
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
    '--vj-rest-opacity': '0.7',
    '--vj-active-opacity': '1',
    '--vj-transition': '0s',
  },
};
