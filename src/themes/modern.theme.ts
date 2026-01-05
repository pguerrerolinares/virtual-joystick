/**
 * Modern theme - clean CSS-only design.
 */

import type { Theme, ThemeConfig } from './theme.interface';

export const modernTheme: Theme = {
  name: 'modern',

  joystick: {
    pad: {
      type: 'css',
      css: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2)',
      },
    },
    nub: {
      type: 'css',
      sizeRatio: 0.5,
      css: {
        background: 'linear-gradient(135deg, #4a90d9 0%, #357abd 100%)',
        border: '2px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '50%',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      },
    },
  },

  actionButton: {
    button: {
      type: 'css',
      css: {
        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
        border: '2px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '50%',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      },
    },
  },

  animations: {
    fadeIn: 'fadeIn 0.15s ease-out',
    fadeOut: 'fadeOut 0.15s ease-in',
    press: 'press 0.1s ease-out',
    release: 'release 0.15s ease-out',
  },
};

export const modernThemeConfig: ThemeConfig = {
  theme: modernTheme,
  cssVars: {
    '--vj-size': '100px',
    '--vj-color': '#4a90d9',
    '--vj-rest-opacity': '0.5',
    '--vj-active-opacity': '1',
    '--vj-transition': '0.15s ease-out',
  },
};
