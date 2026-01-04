/**
 * Charge button component styles using Constructable Stylesheet.
 */

export const styles = new CSSStyleSheet();

styles.replaceSync(`
  :host {
    display: inline-block;
    --vcb-size: 64px;
    --vcb-color: #27ae60;
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
    border-radius: 50%;
    background: linear-gradient(135deg, var(--vcb-color) 0%, color-mix(in srgb, var(--vcb-color), black 20%) 100%);
    border: 2px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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
    inset: calc(var(--vcb-ring-width) * -0.5);
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

  /* Theme: pixel-art */
  :host([theme="pixel-art"]) .button {
    border-radius: 0;
    background: #6a9c6a;
    border: 4px solid #7aac7a;
    box-shadow: 4px 4px 0 #5a8c5a;
    image-rendering: pixelated;
  }

  :host([theme="pixel-art"]) .ring-progress,
  :host([theme="pixel-art"]) .ring-track {
    stroke-width: 6px;
  }

  :host([theme="pixel-art"]) .ring-track {
    stroke: rgba(58, 58, 92, 0.5);
  }

  /* Theme: custom */
  :host([theme="custom"]) .button {
    background: none;
    border: none;
    box-shadow: none;
  }

  :host([theme="custom"]) .ring-track,
  :host([theme="custom"]) .ring-progress {
    display: none;
  }
`);
