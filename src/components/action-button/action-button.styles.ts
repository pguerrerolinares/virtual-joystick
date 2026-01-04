/**
 * Action button component styles using Constructable Stylesheet.
 */

export const styles = new CSSStyleSheet();

styles.replaceSync(`
  :host {
    display: inline-block;
    --vab-size: 64px;
    --vab-color: #e74c3c;

    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  :host([hidden]) {
    display: none;
  }

  .button {
    width: var(--vab-size);
    height: var(--vab-size);
    border-radius: 50%;
    background: linear-gradient(135deg, var(--vab-color) 0%, color-mix(in srgb, var(--vab-color), black 20%) 100%);
    border: 2px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
    cursor: pointer;
  }

  .button:active,
  .button.pressed {
    transform: scale(0.95);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .icon {
    width: 60%;
    height: 60%;
    fill: white;
    pointer-events: none;
  }

  /* Default slot for custom content */
  ::slotted(*) {
    pointer-events: none;
  }

  /* Theme: pixel-art */
  :host([theme="pixel-art"]) .button {
    border-radius: 0;
    background: #8c5a5a;
    border: 4px solid #9c6a6a;
    box-shadow: 4px 4px 0 #7c4a4a;
    image-rendering: pixelated;
  }

  :host([theme="pixel-art"]) .button:active,
  :host([theme="pixel-art"]) .button.pressed {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 #7c4a4a;
  }

  /* Theme: custom */
  :host([theme="custom"]) .button {
    background: none;
    border: none;
    box-shadow: none;
  }
`);
