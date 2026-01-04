/**
 * Joystick component styles using Constructable Stylesheet.
 */

export const styles = new CSSStyleSheet();

styles.replaceSync(`
  :host {
    display: block;
    position: relative;
    --vj-size: 100px;
    --vj-nub-ratio: 0.5;
    --vj-rest-opacity: 0.5;
    --vj-active-opacity: 1;
    --vj-transition: 0.15s ease-out;

    /* iOS Safari fixes (#185) */
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-text-size-adjust: none;
  }

  :host([hidden]) {
    display: none;
  }

  :host([mode="static"]) .container {
    position: relative;
  }

  :host([mode="dynamic"]) .container,
  :host([mode="semi"]) .container {
    position: fixed;
    pointer-events: none;
  }

  .container {
    width: var(--vj-size);
    height: var(--vj-size);
    opacity: var(--vj-rest-opacity);
    transition: opacity var(--vj-transition);
  }

  .container.active {
    opacity: var(--vj-active-opacity);
  }

  .pad {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  }

  .nub {
    position: absolute;
    width: calc(var(--vj-size) * var(--vj-nub-ratio));
    height: calc(var(--vj-size) * var(--vj-nub-ratio));
    border-radius: 50%;
    background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
    border: 2px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    transition: none;
    will-change: transform;
  }

  .container:not(.active) .nub {
    transition: transform var(--vj-transition);
  }

  /* Theme: pixel-art */
  :host([theme="pixel-art"]) .pad,
  :host([theme="pixel-art"]) .nub {
    border-radius: 0;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  :host([theme="pixel-art"]) .pad {
    background: #2a2a4c;
    border: 4px solid #3a3a5c;
    box-shadow: inset 4px 4px 0 #1a1a3c;
  }

  :host([theme="pixel-art"]) .nub {
    background: #5a5a8c;
    border: 4px solid #6a6a9c;
    box-shadow: 4px 4px 0 #4a4a7c;
  }

  /* Theme: custom - minimal styles for user customization */
  :host([theme="custom"]) .pad,
  :host([theme="custom"]) .nub {
    background: none;
    border: none;
    box-shadow: none;
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: var(--vj-rest-opacity); }
  }

  @keyframes fadeOut {
    from { opacity: var(--vj-rest-opacity); }
    to { opacity: 0; }
  }

  @keyframes pixelFadeIn {
    0% { opacity: 0; }
    33% { opacity: 0.3; }
    66% { opacity: 0.6; }
    100% { opacity: var(--vj-rest-opacity); }
  }

  @keyframes pixelFadeOut {
    0% { opacity: var(--vj-rest-opacity); }
    33% { opacity: 0.6; }
    66% { opacity: 0.3; }
    100% { opacity: 0; }
  }
`);
