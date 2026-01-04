import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TouchManager, type TouchData } from '../../src/core/touch-manager';

// Helper to create mock TouchEvent
function createMockTouchEvent(
  type: string,
  touches: Array<{ identifier: number; clientX: number; clientY: number }>
): TouchEvent {
  const touchList = touches.map((t) => ({
    identifier: t.identifier,
    clientX: t.clientX,
    clientY: t.clientY,
    target: document.body,
  })) as unknown as Touch[];

  return {
    type,
    changedTouches: touchList,
    touches: touchList,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as TouchEvent;
}

describe('TouchManager', () => {
  let manager: TouchManager;

  beforeEach(() => {
    manager = new TouchManager();
  });

  describe('handleTouchStart', () => {
    it('should track new touches', () => {
      const event = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);

      manager.handleTouchStart(event);

      expect(manager.hasTouch(1)).toBe(true);
      const touch = manager.getTouch(1);
      expect(touch?.startX).toBe(100);
      expect(touch?.startY).toBe(200);
    });

    it('should track multiple touches', () => {
      const event = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
        { identifier: 2, clientX: 300, clientY: 400 },
      ]);

      manager.handleTouchStart(event);

      expect(manager.hasTouch(1)).toBe(true);
      expect(manager.hasTouch(2)).toBe(true);
    });

    it('should call onStart callback', () => {
      const callback = vi.fn();
      manager.onStart(callback);

      const event = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);

      manager.handleTouchStart(event);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 1,
          startX: 100,
          startY: 200,
        })
      );
    });
  });

  describe('handleTouchMove', () => {
    it('should update touch position', () => {
      const startEvent = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);
      manager.handleTouchStart(startEvent);

      const moveEvent = createMockTouchEvent('touchmove', [
        { identifier: 1, clientX: 150, clientY: 250 },
      ]);
      manager.handleTouchMove(moveEvent);

      const touch = manager.getTouch(1);
      expect(touch?.currentX).toBe(150);
      expect(touch?.currentY).toBe(250);
      // Start position should remain unchanged
      expect(touch?.startX).toBe(100);
      expect(touch?.startY).toBe(200);
    });

    it('should call onMove callback', () => {
      const callback = vi.fn();
      manager.onMove(callback);

      const startEvent = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);
      manager.handleTouchStart(startEvent);

      const moveEvent = createMockTouchEvent('touchmove', [
        { identifier: 1, clientX: 150, clientY: 250 },
      ]);
      manager.handleTouchMove(moveEvent);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 1,
          currentX: 150,
          currentY: 250,
        })
      );
    });

    it('should only update tracked touches', () => {
      const callback = vi.fn();
      manager.onMove(callback);

      // Move without start - should not call callback
      const moveEvent = createMockTouchEvent('touchmove', [
        { identifier: 99, clientX: 150, clientY: 250 },
      ]);
      manager.handleTouchMove(moveEvent);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('handleTouchEnd', () => {
    it('should remove ended touch', () => {
      const startEvent = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);
      manager.handleTouchStart(startEvent);

      expect(manager.hasTouch(1)).toBe(true);

      const endEvent = createMockTouchEvent('touchend', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);
      manager.handleTouchEnd(endEvent);

      expect(manager.hasTouch(1)).toBe(false);
    });

    it('should only remove touches from changedTouches', () => {
      // Start two touches
      const startEvent = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
        { identifier: 2, clientX: 300, clientY: 400 },
      ]);
      manager.handleTouchStart(startEvent);

      // End only touch 1
      const endEvent = createMockTouchEvent('touchend', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);
      manager.handleTouchEnd(endEvent);

      expect(manager.hasTouch(1)).toBe(false);
      expect(manager.hasTouch(2)).toBe(true);
    });

    it('should call onEnd callback', () => {
      const callback = vi.fn();
      manager.onEnd(callback);

      const startEvent = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);
      manager.handleTouchStart(startEvent);

      const endEvent = createMockTouchEvent('touchend', [
        { identifier: 1, clientX: 150, clientY: 250 },
      ]);
      manager.handleTouchEnd(endEvent);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 1,
        })
      );
    });
  });

  describe('releaseAll', () => {
    it('should release all touches and call onEnd for each', () => {
      const callback = vi.fn();
      manager.onEnd(callback);

      const startEvent = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
        { identifier: 2, clientX: 300, clientY: 400 },
      ]);
      manager.handleTouchStart(startEvent);

      manager.releaseAll();

      expect(callback).toHaveBeenCalledTimes(2);
      expect(manager.activeTouches.size).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all touches without calling callbacks', () => {
      const callback = vi.fn();
      manager.onEnd(callback);

      const startEvent = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);
      manager.handleTouchStart(startEvent);

      manager.clear();

      expect(callback).not.toHaveBeenCalled();
      expect(manager.activeTouches.size).toBe(0);
    });
  });

  describe('destroy', () => {
    it('should clear touches and remove callbacks', () => {
      const callback = vi.fn();
      manager.onStart(callback);

      manager.destroy();

      const startEvent = createMockTouchEvent('touchstart', [
        { identifier: 1, clientX: 100, clientY: 200 },
      ]);
      manager.handleTouchStart(startEvent);

      // Touch should still be tracked but callback shouldn't fire
      expect(manager.hasTouch(1)).toBe(true);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('chaining', () => {
    it('should support method chaining', () => {
      const result = manager
        .onStart(() => {})
        .onMove(() => {})
        .onEnd(() => {});

      expect(result).toBe(manager);
    });
  });
});
