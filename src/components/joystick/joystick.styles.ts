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
    --vj-pad-bg: rgba(255, 255, 255, 0.1);
    --vj-pad-border: 2px solid rgba(255, 255, 255, 0.3);
    --vj-nub-bg: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
    --vj-nub-border: 2px solid rgba(255, 255, 255, 0.4);

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

  /* Mode: static - fixed position within parent */
  :host([mode="static"]) .container {
    position: relative;
  }

  /* Mode: dynamic - appears at touch location, hidden by default */
  :host([mode="dynamic"]) .container {
    position: fixed;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--vj-transition), visibility 0s var(--vj-transition);
  }

  :host([mode="dynamic"]) .container.active {
    opacity: var(--vj-active-opacity);
    visibility: visible;
    transition: opacity var(--vj-transition), visibility 0s 0s;
  }

  /* Mode: semi - visible at position, can be caught */
  :host([mode="semi"]) .container {
    position: absolute;
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

  /* ========================
     Theme: Modern (default)
     ======================== */
  .pad {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--vj-pad-bg);
    border: var(--vj-pad-border);
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  }

  .nub {
    position: absolute;
    width: calc(var(--vj-size) * var(--vj-nub-ratio));
    height: calc(var(--vj-size) * var(--vj-nub-ratio));
    border-radius: 50%;
    background: var(--vj-nub-bg);
    border: var(--vj-nub-border);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    /* CSS vars for position (dondido pattern) */
    --vj-nub-x: 0px;
    --vj-nub-y: 0px;
    transform: translate(calc(-50% + var(--vj-nub-x)), calc(-50% + var(--vj-nub-y)));
    left: 50%;
    top: 50%;
    transition: none;
    will-change: transform;
  }

  .container:not(.active) .nub {
    transition: transform var(--vj-transition);
  }

  /* ========================
     Theme: Custom
     Minimal styles for user customization via CSS vars
     ======================== */
  :host([theme="custom"]) .pad {
    background: var(--vj-pad-bg, none);
    border: var(--vj-pad-border, none);
    box-shadow: var(--vj-pad-shadow, none);
    border-radius: var(--vj-pad-radius, 50%);
  }

  :host([theme="custom"]) .nub {
    background: var(--vj-nub-bg, none);
    border: var(--vj-nub-border, none);
    box-shadow: var(--vj-nub-shadow, none);
    border-radius: var(--vj-nub-radius, 50%);
  }

  /* ========================
     Shape: Square
     ======================== */
  :host([shape="square"]) .pad {
    border-radius: 12px;
  }

  :host([shape="square"]) .nub {
    border-radius: 8px;
  }

  /* ========================
     Animations
     ======================== */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: var(--vj-rest-opacity); }
  }

  @keyframes fadeOut {
    from { opacity: var(--vj-rest-opacity); }
    to { opacity: 0; }
  }
`);
