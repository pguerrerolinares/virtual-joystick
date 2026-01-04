/**
 * Joystick component styles using Constructable Stylesheet.
 */

import { PIXEL_PAD_SVG, PIXEL_NUB_SVG } from '../../themes/sprites';

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

  /* Mode: semi - visible at fixed position, can be caught */
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
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    transition: none;
    will-change: transform;
  }

  .container:not(.active) .nub {
    transition: transform var(--vj-transition);
  }

  /* ========================
     Theme: Pixel Art
     ======================== */
  :host([theme="pixel-art"]) {
    --vj-transition: 0s;
    --vj-rest-opacity: 0.8;
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

  /* Pixel art + square = sharp corners */
  :host([theme="pixel-art"][shape="square"]) .pad,
  :host([theme="pixel-art"][shape="square"]) .nub {
    border-radius: 0;
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
