import { describe, it, expect } from 'vitest';
import {
  distance,
  angle,
  calculateAngle,
  clampToCircle,
  clampToSquare,
  normalizeVector,
  getDirection,
} from '../../src/core/math-utils';

describe('math-utils', () => {
  describe('distance', () => {
    it('should calculate distance between two points', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(distance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
      expect(distance({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(5);
    });

    it('should handle negative coordinates', () => {
      expect(distance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5);
    });
  });

  describe('angle', () => {
    it('should calculate angle in radians', () => {
      expect(angle({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
      expect(angle({ x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
      expect(angle({ x: 0, y: 0 }, { x: -1, y: 0 })).toBeCloseTo(Math.PI);
    });
  });

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

  describe('getDirection', () => {
    it('should return right for 0 degrees', () => {
      const result = getDirection(0);
      expect(result.angle).toBe('right');
    });

    it('should return up for 90 degrees', () => {
      // Note: In screen coordinates, positive Y is down, but our angle calculation
      // uses mathematical convention where positive Y is up
      const result = getDirection(90);
      expect(result.angle).toBe('up');
    });

    it('should return left for 180 degrees', () => {
      const result = getDirection(180);
      expect(result.angle).toBe('left');
    });

    it('should return down for 270 degrees', () => {
      const result = getDirection(270);
      expect(result.angle).toBe('down');
    });

    it('should return diagonal directions', () => {
      expect(getDirection(45).angle).toBe('up-right');
      expect(getDirection(135).angle).toBe('up-left');
      expect(getDirection(225).angle).toBe('down-left');
      expect(getDirection(315).angle).toBe('down-right');
    });

    it('should handle x and y directions separately', () => {
      const result = getDirection(45);
      expect(result.x).toBe('right');
      expect(result.y).toBe('up');
    });
  });
});
