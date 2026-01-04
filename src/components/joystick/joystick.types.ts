/**
 * Types for virtual-joystick component.
 */

import type { Direction, Point, AngleData } from '../../core/math-utils';

export type JoystickMode = 'static' | 'semi' | 'dynamic';
export type JoystickShape = 'circle' | 'square';
export type JoystickTheme = 'modern' | 'pixel-art' | 'custom';

export interface JoystickOptions {
  /** Joystick mode (default: 'dynamic') */
  mode?: JoystickMode;
  /** Visual theme (default: 'modern') */
  theme?: JoystickTheme;
  /** Size in pixels (default: 100) */
  size?: number;
  /** Deadzone threshold 0-1 (default: 0.1) */
  threshold?: number;
  /** Shape for clamping (default: 'circle') */
  shape?: JoystickShape;
  /** Lock X axis movement */
  lockX?: boolean;
  /** Lock Y axis movement */
  lockY?: boolean;
  /** Distance to catch joystick in semi mode (default: 50) */
  catchDistance?: number;
  /** Whether to follow finger beyond limit (default: false) */
  follow?: boolean;
  /** Return to center on release (default: true) */
  restJoystick?: boolean;
  /** Only emit events, no DOM (default: false) */
  dataOnly?: boolean;
}

export interface JoystickStartData {
  /** Touch identifier */
  identifier: number;
  /** Position where touch started */
  position: Point;
  /** Timestamp */
  timestamp: number;
}

export interface JoystickMoveData {
  /** Touch identifier */
  identifier: number;
  /** Normalized position -1 to 1 */
  position: Point;
  /** Raw position in pixels from center */
  rawPosition: Point;
  /** Force 0 to 1 (distance / max distance) */
  force: number;
  /** Distance in pixels from center */
  distance: number;
  /** Angle data */
  angle: AngleData;
  /** Direction data */
  direction: Direction;
  /** Unit vector */
  vector: Point;
  /** Timestamp */
  timestamp: number;
}

export interface JoystickEndData {
  /** Touch identifier */
  identifier: number;
  /** Timestamp */
  timestamp: number;
}

export type JoystickEvents = {
  'joystick-start': CustomEvent<JoystickStartData>;
  'joystick-move': CustomEvent<JoystickMoveData>;
  'joystick-end': CustomEvent<JoystickEndData>;
};

/**
 * Type augmentation for addEventListener with joystick events.
 */
declare global {
  interface HTMLElementEventMap extends JoystickEvents {}
}
