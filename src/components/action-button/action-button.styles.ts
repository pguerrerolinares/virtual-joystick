/**
 * Action button component styles using Constructable Stylesheet.
 */

export const styles = new CSSStyleSheet();

styles.replaceSync(`
  :host {
    display: inline-block;
    --vab-size: 64px;
    --vab-color: #e74c3c;
    --vab-bg: linear-gradient(135deg, var(--vab-color) 0%, color-mix(in srgb, var(--vab-color), black 20%) 100%);
    --vab-border: 2px solid rgba(255, 255, 255, 0.4);
    --vab-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    --vab-radius: 50%;

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
    border-radius: var(--vab-radius);
    background: var(--vab-bg);
    border: var(--vab-border);
    box-shadow: var(--vab-shadow);
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

  /* ========================
     Theme: Custom
     ======================== */
  :host([theme="custom"]) .button {
    background: var(--vab-bg, none);
    border: var(--vab-border, none);
    box-shadow: var(--vab-shadow, none);
    border-radius: var(--vab-radius, 50%);
  }
`);
