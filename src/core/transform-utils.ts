/**
 * CSS Transform compensation utilities.
 * Fixes nipplejs #222 - incorrect position when parent has CSS transforms.
 */

export interface LocalPosition {
  x: number;
  y: number;
}

/**
 * Get local position within element, compensating for CSS transforms.
 * Uses DOMMatrix.inverse() to correctly handle rotated/scaled containers.
 *
 * @param clientX - Touch/mouse clientX
 * @param clientY - Touch/mouse clientY
 * @param element - Target element
 * @returns Local coordinates relative to element's top-left
 */
export function getLocalPosition(
  clientX: number,
  clientY: number,
  element: HTMLElement
): LocalPosition {
  const rect = element.getBoundingClientRect();
  const transform = getComputedStyle(element).transform;

  // No transform - simple calculation
  if (transform === 'none') {
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  // Invert the transformation matrix to get local coordinates
  try {
    const matrix = new DOMMatrix(transform);

    // Check if matrix is invertible (2D determinant: ad - bc)
    const det = matrix.a * matrix.d - matrix.b * matrix.c;
    if (Math.abs(det) < 1e-10) {
      // Singular matrix - fallback to simple calculation
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    const inverted = matrix.inverse();
    const point = new DOMPoint(clientX - rect.left, clientY - rect.top);
    const transformed = point.matrixTransform(inverted);

    return { x: transformed.x, y: transformed.y };
  } catch {
    // Fallback for any DOMMatrix errors
    return { x: clientX - rect.left, y: clientY - rect.top };
  }
}

