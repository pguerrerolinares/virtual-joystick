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

export interface Direction {
  x: 'left' | 'right' | 'center';
  y: 'up' | 'down' | 'center';
  angle:
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'up-left'
    | 'up-right'
    | 'down-left'
    | 'down-right'
    | 'center';
}

/**
 * Calculate distance between two points.
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**
 * Calculate angle between two points in radians.
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
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
 * Get cardinal and diagonal direction from angle.
 * @param degree - Angle in degrees (0-360)
 */
export function getDirection(degree: number): Direction {
  // Normalize degree to 0-360
  const normalizedDegree = ((degree % 360) + 360) % 360;

  // Determine x direction
  let xDir: 'left' | 'right' | 'center' = 'center';
  if (normalizedDegree > 22.5 && normalizedDegree < 157.5) {
    xDir = 'right';
  } else if (normalizedDegree > 202.5 && normalizedDegree < 337.5) {
    xDir = 'left';
  }

  // Determine y direction (inverted because screen Y is inverted)
  let yDir: 'up' | 'down' | 'center' = 'center';
  if (normalizedDegree > 112.5 && normalizedDegree < 247.5) {
    yDir = 'down';
  } else if (normalizedDegree < 67.5 || normalizedDegree > 292.5) {
    yDir = 'up';
  }

  // Determine angle direction (8 directions)
  let angleDir: Direction['angle'] = 'center';

  if (normalizedDegree >= 337.5 || normalizedDegree < 22.5) {
    angleDir = 'right';
  } else if (normalizedDegree >= 22.5 && normalizedDegree < 67.5) {
    angleDir = 'up-right';
  } else if (normalizedDegree >= 67.5 && normalizedDegree < 112.5) {
    angleDir = 'up';
  } else if (normalizedDegree >= 112.5 && normalizedDegree < 157.5) {
    angleDir = 'up-left';
  } else if (normalizedDegree >= 157.5 && normalizedDegree < 202.5) {
    angleDir = 'left';
  } else if (normalizedDegree >= 202.5 && normalizedDegree < 247.5) {
    angleDir = 'down-left';
  } else if (normalizedDegree >= 247.5 && normalizedDegree < 292.5) {
    angleDir = 'down';
  } else if (normalizedDegree >= 292.5 && normalizedDegree < 337.5) {
    angleDir = 'down-right';
  }

  return { x: xDir, y: yDir, angle: angleDir };
}
