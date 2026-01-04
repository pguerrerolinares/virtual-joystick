/**
 * Types for virtual-action-button component.
 */

export type ActionButtonTheme = 'modern' | 'pixel-art' | 'custom';

export interface ActionButtonOptions {
  /** Visual theme (default: 'modern') */
  theme?: ActionButtonTheme;
  /** Size in pixels (default: 64) */
  size?: number;
  /** Icon name or custom SVG */
  icon?: string;
}

export interface ActionButtonPressData {
  /** Timestamp when pressed */
  timestamp: number;
}

export interface ActionButtonReleaseData {
  /** Timestamp when released */
  timestamp: number;
  /** Duration of press in ms */
  duration: number;
}

export type ActionButtonEvents = {
  'button-press': CustomEvent<ActionButtonPressData>;
  'button-release': CustomEvent<ActionButtonReleaseData>;
};

declare global {
  interface HTMLElementEventMap extends ActionButtonEvents {}
}
