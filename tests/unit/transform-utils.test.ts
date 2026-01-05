import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLocalPosition } from '../../src/core/transform-utils';

// Mock DOMMatrix class
class MockDOMMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;

  constructor(transform?: string) {
    // Default to identity matrix
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;

    if (transform && transform !== 'none') {
      // Parse matrix(a, b, c, d, e, f)
      const match = transform.match(
        /matrix\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/
      );
      if (match) {
        this.a = parseFloat(match[1]);
        this.b = parseFloat(match[2]);
        this.c = parseFloat(match[3]);
        this.d = parseFloat(match[4]);
        this.e = parseFloat(match[5]);
        this.f = parseFloat(match[6]);
      }
    }
  }

  inverse(): MockDOMMatrix {
    const det = this.a * this.d - this.b * this.c;
    const inv = new MockDOMMatrix();
    inv.a = this.d / det;
    inv.b = -this.b / det;
    inv.c = -this.c / det;
    inv.d = this.a / det;
    inv.e = (this.c * this.f - this.d * this.e) / det;
    inv.f = (this.b * this.e - this.a * this.f) / det;
    return inv;
  }
}

// Mock DOMPoint class
class MockDOMPoint {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  matrixTransform(matrix: MockDOMMatrix): MockDOMPoint {
    return new MockDOMPoint(
      matrix.a * this.x + matrix.c * this.y + matrix.e,
      matrix.b * this.x + matrix.d * this.y + matrix.f
    );
  }
}

describe('transform-utils', () => {
  let mockElement: HTMLElement;
  let originalDOMMatrix: typeof globalThis.DOMMatrix;
  let originalDOMPoint: typeof globalThis.DOMPoint;

  beforeEach(() => {
    mockElement = document.createElement('div');

    // Store originals and set mocks
    originalDOMMatrix = globalThis.DOMMatrix;
    originalDOMPoint = globalThis.DOMPoint;
    (globalThis as unknown as Record<string, unknown>).DOMMatrix = MockDOMMatrix;
    (globalThis as unknown as Record<string, unknown>).DOMPoint = MockDOMPoint;
  });

  afterEach(() => {
    // Restore originals
    (globalThis as unknown as Record<string, unknown>).DOMMatrix = originalDOMMatrix;
    (globalThis as unknown as Record<string, unknown>).DOMPoint = originalDOMPoint;
    vi.restoreAllMocks();
  });

  describe('getLocalPosition', () => {
    it('should return simple offset when no transform', () => {
      vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 50,
        width: 200,
        height: 200,
        right: 300,
        bottom: 250,
        x: 100,
        y: 50,
        toJSON: () => ({}),
      });

      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        transform: 'none',
      } as CSSStyleDeclaration);

      const result = getLocalPosition(150, 100, mockElement);

      expect(result.x).toBe(50); // 150 - 100
      expect(result.y).toBe(50); // 100 - 50
    });

    it('should handle scale transform', () => {
      vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 50,
        width: 400, // Scaled 2x from 200
        height: 400,
        right: 500,
        bottom: 450,
        x: 100,
        y: 50,
        toJSON: () => ({}),
      });

      // scale(2) matrix: [2, 0, 0, 2, 0, 0]
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        transform: 'matrix(2, 0, 0, 2, 0, 0)',
      } as CSSStyleDeclaration);

      const result = getLocalPosition(200, 150, mockElement);

      // Input relative to rect: (200-100, 150-50) = (100, 100)
      // After inverse scale(0.5): (50, 50)
      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(50);
    });

    it('should handle translate transform', () => {
      vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        left: 150, // Translated 50px
        top: 100, // Translated 50px
        width: 200,
        height: 200,
        right: 350,
        bottom: 300,
        x: 150,
        y: 100,
        toJSON: () => ({}),
      });

      // translate(50px, 50px) matrix: [1, 0, 0, 1, 50, 50]
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        transform: 'matrix(1, 0, 0, 1, 50, 50)',
      } as CSSStyleDeclaration);

      const result = getLocalPosition(200, 150, mockElement);

      // Input relative to rect: (200-150, 150-100) = (50, 50)
      // After inverse translate(-50, -50): (0, 0)
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
    });

    it('should handle rotation transform', () => {
      vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 100,
        width: 200,
        height: 200,
        right: 300,
        bottom: 300,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      });

      // rotate(90deg) matrix: [0, 1, -1, 0, 0, 0]
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        transform: 'matrix(0, 1, -1, 0, 0, 0)',
      } as CSSStyleDeclaration);

      const result = getLocalPosition(200, 200, mockElement);

      // Input relative to rect: (100, 100)
      // After inverse rotation (-90deg), x and y transform
      expect(result.x).toBeCloseTo(100);
      expect(result.y).toBeCloseTo(-100);
    });
  });
});
