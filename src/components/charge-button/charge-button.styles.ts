/**
 * Charge button component styles using Constructable Stylesheet.
 */

import { PIXEL_BUTTON_GREEN_SVG } from '../../themes/sprites';

export const styles = new CSSStyleSheet();

styles.replaceSync(`
  :host {
    display: inline-block;
    --vcb-size: 64px;
    --vcb-color: #27ae60;
    --vcb-bg: linear-gradient(135deg, var(--vcb-color) 0%, color-mix(in srgb, var(--vcb-color), black 20%) 100%);
    --vcb-border: 2px solid rgba(255, 255, 255, 0.4);
    --vcb-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    --vcb-radius: 50%;
    --vcb-ring-width: 4px;
    --vcb-ring-track: rgba(255, 255, 255, 0.2);

    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  :host([hidden]) {
    display: none;
  }

  .container {
    position: relative;
    width: var(--vcb-size);
    height: var(--vcb-size);
  }

  .button {
    width: 100%;
    height: 100%;
    border-radius: var(--vcb-radius);
    background: var(--vcb-bg);
    border: var(--vcb-border);
    box-shadow: var(--vcb-shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    transition: transform 0.1s ease-out;
    cursor: pointer;
  }

  .button.pressed {
    transform: scale(0.95);
  }

  .button.fully-charged {
    animation: pulse 0.3s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from { transform: scale(0.95); }
    to { transform: scale(1.0); }
  }

  /* Charge ring SVG */
  .ring-container {
    position: absolute;
    inset: calc(var(--ring-offset, 6px) * -1);
    pointer-events: none;
  }

  .ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .ring-track {
    fill: none;
    stroke: var(--vcb-ring-track);
    stroke-width: var(--vcb-ring-width);
  }

  .ring-progress {
    fill: none;
    stroke: var(--vcb-color);
    stroke-width: var(--vcb-ring-width);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.05s linear;
  }

  /* Percentage text */
  .percent {
    font-family: system-ui, sans-serif;
    font-size: calc(var(--vcb-size) * 0.25);
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  :host(:not([show-percentage])) .percent {
    display: none;
  }

  /* Default slot */
  ::slotted(*) {
    pointer-events: none;
  }

  /* ========================
     Theme: Pixel Art
     ======================== */
  :host([theme="pixel-art"]) .button {
    background: url('${PIXEL_BUTTON_GREEN_SVG}') center/contain no-repeat;
    border: none;
    box-shadow: none;
    border-radius: 0;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  :host([theme="pixel-art"]) .button.pressed {
    transform: translate(2px, 2px) scale(0.95);
  }

  :host([theme="pixel-art"]) .ring-progress,
  :host([theme="pixel-art"]) .ring-track {
    stroke-width: 6px;
  }

  :host([theme="pixel-art"]) .ring-track {
    stroke: rgba(42, 42, 76, 0.5);
  }

  :host([theme="pixel-art"]) .ring-progress {
    stroke-linecap: square;
  }

  :host([theme="pixel-art"]) .percent {
    font-family: monospace;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
  }

  /* ========================
     Theme: Custom
     ======================== */
  :host([theme="custom"]) .button {
    background: var(--vcb-bg, none);
    border: var(--vcb-border, none);
    box-shadow: var(--vcb-shadow, none);
    border-radius: var(--vcb-radius, 50%);
  }

  :host([theme="custom"]) .ring-track,
  :host([theme="custom"]) .ring-progress {
    display: none;
  }
`);
