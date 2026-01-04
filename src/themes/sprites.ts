/**
 * SVG Sprites for pixel-art theme.
 * All sprites use a 32x32 or 16x16 grid for authentic pixel look.
 */

/**
 * Joystick pad - 32x32 pixel art circle with depth (improved)
 * Circle fits within the viewBox with proper padding
 */
export const PIXEL_PAD_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
  <!-- Background fill for circle shape -->
  <rect x="10" y="2" width="12" height="2" fill="#2a2a4c"/>
  <rect x="6" y="4" width="20" height="2" fill="#2a2a4c"/>
  <rect x="4" y="6" width="24" height="2" fill="#2a2a4c"/>
  <rect x="2" y="8" width="28" height="16" fill="#2a2a4c"/>
  <rect x="4" y="24" width="24" height="2" fill="#2a2a4c"/>
  <rect x="6" y="26" width="20" height="2" fill="#2a2a4c"/>
  <rect x="10" y="28" width="12" height="2" fill="#2a2a4c"/>

  <!-- Outer highlight (top-left) -->
  <rect x="10" y="2" width="12" height="2" fill="#4a4a7c"/>
  <rect x="6" y="4" width="4" height="2" fill="#4a4a7c"/>
  <rect x="4" y="6" width="2" height="2" fill="#4a4a7c"/>
  <rect x="2" y="8" width="2" height="8" fill="#4a4a7c"/>

  <!-- Outer shadow (bottom-right) -->
  <rect x="28" y="8" width="2" height="8" fill="#1a1a3c"/>
  <rect x="26" y="24" width="2" height="2" fill="#1a1a3c"/>
  <rect x="22" y="26" width="4" height="2" fill="#1a1a3c"/>
  <rect x="10" y="28" width="12" height="2" fill="#1a1a3c"/>

  <!-- Inner depression -->
  <rect x="10" y="8" width="12" height="2" fill="#1a1a3c"/>
  <rect x="8" y="10" width="16" height="12" fill="#1a1a3c"/>
  <rect x="10" y="22" width="12" height="2" fill="#1a1a3c"/>

  <!-- Inner highlight -->
  <rect x="10" y="10" width="8" height="2" fill="#3a3a5c"/>
  <rect x="8" y="12" width="2" height="6" fill="#3a3a5c"/>
</svg>
`)}`;

/**
 * Simplified joystick pad - 16x16 for smaller sizes
 */
export const PIXEL_PAD_SIMPLE_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <!-- Circle base -->
  <rect x="4" y="1" width="8" height="1" fill="#3a3a5c"/>
  <rect x="2" y="2" width="12" height="1" fill="#3a3a5c"/>
  <rect x="1" y="3" width="14" height="10" fill="#2a2a4c"/>
  <rect x="2" y="13" width="12" height="1" fill="#2a2a4c"/>
  <rect x="4" y="14" width="8" height="1" fill="#1a1a3c"/>

  <!-- Highlight -->
  <rect x="1" y="3" width="1" height="5" fill="#4a4a7c"/>
  <rect x="2" y="2" width="4" height="1" fill="#4a4a7c"/>

  <!-- Inner hole -->
  <rect x="5" y="5" width="6" height="6" fill="#1a1a3c"/>
</svg>
`)}`;

/**
 * Joystick nub - 16x16 pixel art circle button (improved)
 */
export const PIXEL_NUB_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <!-- Circle base -->
  <rect x="4" y="1" width="8" height="1" fill="#7a7aac"/>
  <rect x="2" y="2" width="12" height="1" fill="#7a7aac"/>
  <rect x="1" y="3" width="14" height="2" fill="#6a6a9c"/>
  <rect x="1" y="5" width="14" height="6" fill="#5a5a8c"/>
  <rect x="1" y="11" width="14" height="2" fill="#4a4a7c"/>
  <rect x="2" y="13" width="12" height="1" fill="#4a4a7c"/>
  <rect x="4" y="14" width="8" height="1" fill="#3a3a5c"/>

  <!-- Top highlight -->
  <rect x="4" y="1" width="6" height="1" fill="#8a8abc"/>
  <rect x="2" y="2" width="4" height="1" fill="#8a8abc"/>
  <rect x="1" y="3" width="2" height="4" fill="#8a8abc"/>

  <!-- Inner shine -->
  <rect x="4" y="4" width="4" height="2" fill="#9a9acc"/>
  <rect x="4" y="6" width="2" height="2" fill="#9a9acc"/>

  <!-- Bottom shadow -->
  <rect x="13" y="5" width="1" height="6" fill="#3a3a5c"/>
  <rect x="12" y="11" width="2" height="2" fill="#3a3a5c"/>
</svg>
`)}`;

/**
 * Simplified nub - 8x8 for very small sizes
 */
export const PIXEL_NUB_SIMPLE_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
  <rect x="2" y="0" width="4" height="1" fill="#7a7aac"/>
  <rect x="1" y="1" width="6" height="1" fill="#6a6a9c"/>
  <rect x="0" y="2" width="8" height="4" fill="#5a5a8c"/>
  <rect x="1" y="6" width="6" height="1" fill="#4a4a7c"/>
  <rect x="2" y="7" width="4" height="1" fill="#3a3a5c"/>
  <!-- Highlight -->
  <rect x="2" y="1" width="2" height="1" fill="#8a8abc"/>
  <rect x="1" y="2" width="1" height="2" fill="#8a8abc"/>
</svg>
`)}`;

/**
 * Action button - 16x16 red pixel button
 */
export const PIXEL_BUTTON_RED_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <!-- Shadow -->
  <rect x="4" y="14" width="8" height="2" fill="#5c2a2a"/>
  <rect x="2" y="12" width="2" height="2" fill="#5c2a2a"/>
  <rect x="12" y="12" width="2" height="2" fill="#5c2a2a"/>

  <!-- Main body -->
  <rect x="4" y="2" width="8" height="12" fill="#8c4a4a"/>
  <rect x="2" y="4" width="12" height="8" fill="#8c4a4a"/>

  <!-- Highlight top -->
  <rect x="4" y="0" width="8" height="2" fill="#ac6a6a"/>
  <rect x="2" y="2" width="2" height="2" fill="#ac6a6a"/>
  <rect x="12" y="2" width="2" height="2" fill="#ac6a6a"/>
  <rect x="0" y="4" width="2" height="2" fill="#ac6a6a"/>
  <rect x="14" y="4" width="2" height="2" fill="#9c5a5a"/>

  <!-- Inner highlight -->
  <rect x="4" y="4" width="4" height="2" fill="#bc7a7a"/>
  <rect x="4" y="6" width="2" height="2" fill="#bc7a7a"/>

  <!-- Border sides -->
  <rect x="0" y="6" width="2" height="4" fill="#9c5a5a"/>
  <rect x="14" y="6" width="2" height="4" fill="#7c3a3a"/>
  <rect x="0" y="10" width="2" height="2" fill="#8c4a4a"/>
  <rect x="14" y="10" width="2" height="2" fill="#7c3a3a"/>
  <rect x="2" y="12" width="2" height="2" fill="#7c3a3a"/>
  <rect x="12" y="12" width="2" height="2" fill="#7c3a3a"/>
</svg>
`)}`;

/**
 * Charge button - 16x16 green pixel button
 */
export const PIXEL_BUTTON_GREEN_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <!-- Shadow -->
  <rect x="4" y="14" width="8" height="2" fill="#2a5c2a"/>
  <rect x="2" y="12" width="2" height="2" fill="#2a5c2a"/>
  <rect x="12" y="12" width="2" height="2" fill="#2a5c2a"/>

  <!-- Main body -->
  <rect x="4" y="2" width="8" height="12" fill="#4a8c4a"/>
  <rect x="2" y="4" width="12" height="8" fill="#4a8c4a"/>

  <!-- Highlight top -->
  <rect x="4" y="0" width="8" height="2" fill="#6aac6a"/>
  <rect x="2" y="2" width="2" height="2" fill="#6aac6a"/>
  <rect x="12" y="2" width="2" height="2" fill="#6aac6a"/>
  <rect x="0" y="4" width="2" height="2" fill="#6aac6a"/>
  <rect x="14" y="4" width="2" height="2" fill="#5a9c5a"/>

  <!-- Inner highlight -->
  <rect x="4" y="4" width="4" height="2" fill="#7abc7a"/>
  <rect x="4" y="6" width="2" height="2" fill="#7abc7a"/>

  <!-- Border sides -->
  <rect x="0" y="6" width="2" height="4" fill="#5a9c5a"/>
  <rect x="14" y="6" width="2" height="4" fill="#3a7c3a"/>
  <rect x="0" y="10" width="2" height="2" fill="#4a8c4a"/>
  <rect x="14" y="10" width="2" height="2" fill="#3a7c3a"/>
  <rect x="2" y="12" width="2" height="2" fill="#3a7c3a"/>
  <rect x="12" y="12" width="2" height="2" fill="#3a7c3a"/>
</svg>
`)}`;

/**
 * D-pad style arrows for direction indicators
 */
export const PIXEL_ARROW_UP_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
  <rect x="3" y="1" width="2" height="2" fill="#fff"/>
  <rect x="2" y="3" width="4" height="2" fill="#fff"/>
  <rect x="1" y="5" width="6" height="2" fill="#fff"/>
</svg>
`)}`;

export const PIXEL_ARROW_DOWN_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
  <rect x="1" y="1" width="6" height="2" fill="#fff"/>
  <rect x="2" y="3" width="4" height="2" fill="#fff"/>
  <rect x="3" y="5" width="2" height="2" fill="#fff"/>
</svg>
`)}`;

export const PIXEL_ARROW_LEFT_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
  <rect x="1" y="3" width="2" height="2" fill="#fff"/>
  <rect x="3" y="2" width="2" height="4" fill="#fff"/>
  <rect x="5" y="1" width="2" height="6" fill="#fff"/>
</svg>
`)}`;

export const PIXEL_ARROW_RIGHT_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
  <rect x="1" y="1" width="2" height="6" fill="#fff"/>
  <rect x="3" y="2" width="2" height="4" fill="#fff"/>
  <rect x="5" y="3" width="2" height="2" fill="#fff"/>
</svg>
`)}`;
