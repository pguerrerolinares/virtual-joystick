import { describe, it, expect } from 'vitest';
import {
  calculateAngle,
  clampToCircle,
  clampToSquare,
  normalizeVector,
  getCompassDirection,
} from '../../src/core/math-utils';

describe('math-utils', () => {
  describe('calculateAngle', () => {
    it('should return angle data with radian and degree', () => {
      const result = calculateAngle(1, 0);
      expect(result.radian).toBe(0);
      expect(result.degree).toBe(0);
    });

    it('should return 0 for origin point', () => {
      const result = calculateAngle(0, 0);
      expect(result.radian).toBe(0);
      expect(result.degree).toBe(0);
    });

    it('should calculate correct degrees for cardinal directions', () => {
      expect(calculateAngle(1, 0).degree).toBeCloseTo(0);
      expect(calculateAngle(0, 1).degree).toBeCloseTo(90);
      expect(calculateAngle(-1, 0).degree).toBeCloseTo(180);
      expect(calculateAngle(0, -1).degree).toBeCloseTo(270);
    });

    it('should apply lockX', () => {
      const result = calculateAngle(5, 3, true, false);
      // With lockX, effectiveX = 0, so angle should be 90 degrees (pointing up in Y)
      expect(result.degree).toBeCloseTo(90);
    });

    it('should apply lockY', () => {
      const result = calculateAngle(5, 3, false, true);
      // With lockY, effectiveY = 0, so angle should be 0 degrees (pointing right in X)
      expect(result.degree).toBeCloseTo(0);
    });

    it('should return 0 when both axes locked', () => {
      const result = calculateAngle(5, 3, true, true);
      expect(result.radian).toBe(0);
      expect(result.degree).toBe(0);
    });
  });

  describe('clampToCircle', () => {
    it('should not clamp points inside circle', () => {
      const result = clampToCircle(3, 4, 10);
      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });

    it('should clamp points outside circle to boundary', () => {
      const result = clampToCircle(30, 40, 10);
      expect(Math.sqrt(result.x ** 2 + result.y ** 2)).toBeCloseTo(10);
      // Direction should be preserved (3:4 ratio)
      expect(result.x / result.y).toBeCloseTo(0.75);
    });

    it('should handle origin point', () => {
      const result = clampToCircle(0, 0, 10);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('clampToSquare', () => {
    it('should not clamp points inside square', () => {
      const result = clampToSquare(5, 5, 10);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    it('should clamp X when outside bounds', () => {
      const result = clampToSquare(15, 5, 10);
      expect(result.x).toBe(10);
      expect(result.y).toBe(5);
    });

    it('should clamp Y when outside bounds', () => {
      const result = clampToSquare(5, -15, 10);
      expect(result.x).toBe(5);
      expect(result.y).toBe(-10);
    });

    it('should clamp both axes when outside bounds', () => {
      const result = clampToSquare(20, -20, 10);
      expect(result.x).toBe(10);
      expect(result.y).toBe(-10);
    });
  });

  describe('normalizeVector', () => {
    it('should normalize to unit length', () => {
      const result = normalizeVector(3, 4);
      expect(Math.sqrt(result.x ** 2 + result.y ** 2)).toBeCloseTo(1);
      expect(result.x).toBeCloseTo(0.6);
      expect(result.y).toBeCloseTo(0.8);
    });

    it('should return zero vector for origin', () => {
      const result = normalizeVector(0, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('getCompassDirection', () => {
    it('should return e for 0 degrees', () => {
      expect(getCompassDirection(0)).toBe('e');
    });

    it('should return n for 90 degrees', () => {
      expect(getCompassDirection(90)).toBe('n');
    });

    it('should return w for 180 degrees', () => {
      expect(getCompassDirection(180)).toBe('w');
    });

    it('should return s for 270 degrees', () => {
      expect(getCompassDirection(270)).toBe('s');
    });

    it('should return correct 8 directions', () => {
      expect(getCompassDirection(0)).toBe('e');
      expect(getCompassDirection(45)).toBe('ne');
      expect(getCompassDirection(90)).toBe('n');
      expect(getCompassDirection(135)).toBe('nw');
      expect(getCompassDirection(180)).toBe('w');
      expect(getCompassDirection(225)).toBe('sw');
      expect(getCompassDirection(270)).toBe('s');
      expect(getCompassDirection(315)).toBe('se');
    });

    it('should return empty string when force is below threshold', () => {
      expect(getCompassDirection(45, 0.05, 0.1)).toBe('');
      expect(getCompassDirection(90, 0.1, 0.1)).toBe('');
    });

    it('should return direction when force is above threshold', () => {
      expect(getCompassDirection(45, 0.5, 0.1)).toBe('ne');
      expect(getCompassDirection(90, 0.2, 0.1)).toBe('n');
    });

    it('should handle angles near sector boundaries', () => {
      // 22.5° is boundary between e and ne - should round to ne
      expect(getCompassDirection(22.5)).toBe('ne');
      // 22° should still be e
      expect(getCompassDirection(22)).toBe('e');
    });

    it('should handle negative angles', () => {
      expect(getCompassDirection(-45)).toBe('se');
      expect(getCompassDirection(-90)).toBe('s');
    });

    it('should handle angles > 360', () => {
      expect(getCompassDirection(405)).toBe('ne'); // 405 % 360 = 45
      expect(getCompassDirection(720)).toBe('e'); // 720 % 360 = 0
    });
  });
});
