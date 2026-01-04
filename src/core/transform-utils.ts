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
  const matrix = new DOMMatrix(transform).inverse();
  const point = new DOMPoint(clientX - rect.left, clientY - rect.top);
  const transformed = point.matrixTransform(matrix);

  return {
    x: transformed.x,
    y: transformed.y,
  };
}

/**
 * Get center-relative position within element.
 * Returns coordinates where (0,0) is the center of the element.
 *
 * @param clientX - Touch/mouse clientX
 * @param clientY - Touch/mouse clientY
 * @param element - Target element
 * @returns Coordinates relative to element's center
 */
export function getCenterRelativePosition(
  clientX: number,
  clientY: number,
  element: HTMLElement
): LocalPosition {
  const local = getLocalPosition(clientX, clientY, element);
  const rect = element.getBoundingClientRect();

  // Adjust for transform scale
  const transform = getComputedStyle(element).transform;
  let width = rect.width;
  let height = rect.height;

  if (transform !== 'none') {
    // Get original dimensions before transform
    const matrix = new DOMMatrix(transform);
    const scaleX = Math.sqrt(matrix.a ** 2 + matrix.b ** 2);
    const scaleY = Math.sqrt(matrix.c ** 2 + matrix.d ** 2);
    width = rect.width / scaleX;
    height = rect.height / scaleY;
  }

  return {
    x: local.x - width / 2,
    y: local.y - height / 2,
  };
}
