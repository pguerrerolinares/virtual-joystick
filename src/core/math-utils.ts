/**
 * Math utilities for joystick calculations.
 */

export interface Point {
  x: number;
  y: number;
}

export interface AngleData {
  radian: number;
  degree: number;
}

/**
 * Simple 8-direction compass (dondido pattern).
 * More game-friendly than verbose direction objects.
 */
export type CompassDirection =
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'nw'
  | '';

/**
 * Calculate distance between two points.
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**
 * Calculate angle from x, y coordinates with optional axis locking.
 */
export function calculateAngle(
  x: number,
  y: number,
  lockX = false,
  lockY = false
): AngleData {
  // Apply locks BEFORE calculating angle (Fix nipplejs #139)
  const effectiveX = lockX ? 0 : x;
  const effectiveY = lockY ? 0 : y;

  if (effectiveX === 0 && effectiveY === 0) {
    return { radian: 0, degree: 0 };
  }

  const radian = Math.atan2(effectiveY, effectiveX);
  const degree = ((radian * 180) / Math.PI + 360) % 360;

  return { radian, degree };
}

/**
 * Clamp point to circle boundary.
 */
export function clampToCircle(x: number, y: number, radius: number): Point {
  const dist = Math.sqrt(x * x + y * y);
  if (dist <= radius) {
    return { x, y };
  }
  const scale = radius / dist;
  return { x: x * scale, y: y * scale };
}

/**
 * Clamp point to square boundary.
 */
export function clampToSquare(x: number, y: number, size: number): Point {
  return {
    x: Math.max(-size, Math.min(size, x)),
    y: Math.max(-size, Math.min(size, y)),
  };
}

/**
 * Normalize vector to unit length.
 */
export function normalizeVector(x: number, y: number): Point {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: x / length, y: y / length };
}

/**
 * Get simple compass direction from angle (dondido pattern).
 * Returns 8 directions: 'n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'.
 * Returns '' if force is below threshold (deadzone).
 *
 * @param degree - Angle in degrees (0-360, where 0/360 = East)
 * @param force - Force magnitude (0-1)
 * @param threshold - Minimum force to register direction (default 0)
 * @returns Compass direction or '' for deadzone
 */
export function getCompassDirection(
  degree: number,
  force = 1,
  threshold = 0
): CompassDirection {
  if (force <= threshold) return '';

  // Directions starting from East (0°), going counter-clockwise
  // E=0°, NE=45°, N=90°, NW=135°, W=180°, SW=225°, S=270°, SE=315°
  const dirs = ['e', 'ne', 'n', 'nw', 'w', 'sw', 's', 'se'] as const;

  // Normalize degree and offset by 22.5° to center each 45° sector
  const normalizedDegree = ((degree % 360) + 360) % 360;
  const index = Math.round(normalizedDegree / 45) % 8;

  return dirs[index] as CompassDirection;
}
