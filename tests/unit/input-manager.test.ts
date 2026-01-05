import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InputManager, type InputData } from '../../src/core/input-manager';

describe('InputManager', () => {
  let manager: InputManager;

  beforeEach(() => {
    manager = new InputManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    manager.destroy();
    vi.useRealTimers();
  });

  describe('Input Tracking', () => {
    it('should track pointer input on pointerdown', () => {
      const event = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 200,
      });

      manager.handlePointerDown(event);

      expect(manager.hasInput(1)).toBe(true);
      const input = manager.getInput(1);
      expect(input?.startX).toBe(100);
      expect(input?.startY).toBe(200);
      expect(input?.inputType).toBe('pointer');
    });

    it('should track mouse input on mousedown', () => {
      const event = new MouseEvent('mousedown', {
        clientX: 150,
        clientY: 250,
      });

      manager.handleMouseDown(event);

      expect(manager.hasInput(0)).toBe(true);
      const input = manager.getInput(0);
      expect(input?.startX).toBe(150);
      expect(input?.startY).toBe(250);
      expect(input?.inputType).toBe('mouse');
    });

    it('should track multiple touch inputs', () => {
      const touch1 = { identifier: 1, clientX: 100, clientY: 100 };
      const touch2 = { identifier: 2, clientX: 200, clientY: 200 };

      const event = {
        changedTouches: [touch1, touch2],
      } as unknown as TouchEvent;

      manager.handleTouchStart(event);

      expect(manager.hasInput(1)).toBe(true);
      expect(manager.hasInput(2)).toBe(true);
      expect(manager.getInput(1)?.inputType).toBe('touch');
      expect(manager.getInput(2)?.inputType).toBe('touch');
    });

    it('should return undefined for non-existent input', () => {
      expect(manager.getInput(999)).toBeUndefined();
      expect(manager.hasInput(999)).toBe(false);
    });

    it('should expose activeInputs as readonly map', () => {
      const event = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 200,
      });

      manager.handlePointerDown(event);

      expect(manager.activeInputs.size).toBe(1);
      expect(manager.activeInputs.get(1)).toBeDefined();
    });
  });

  describe('Callbacks', () => {
    it('should invoke onStart callback', () => {
      const onStart = vi.fn();
      manager.onStart(onStart);

      const event = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 200,
      });
      manager.handlePointerDown(event);

      expect(onStart).toHaveBeenCalledOnce();
      expect(onStart.mock.calls[0][0].identifier).toBe(1);
    });

    it('should invoke onMove callback on touch move', () => {
      const onMove = vi.fn();
      manager.onMove(onMove);

      // First, start a touch
      const startEvent = {
        changedTouches: [{ identifier: 1, clientX: 100, clientY: 100 }],
      } as unknown as TouchEvent;
      manager.handleTouchStart(startEvent);

      // Then move it
      const moveEvent = {
        changedTouches: [{ identifier: 1, clientX: 150, clientY: 150 }],
      } as unknown as TouchEvent;
      manager.handleTouchMove(moveEvent);

      expect(onMove).toHaveBeenCalledOnce();
      const movedInput = onMove.mock.calls[0][0] as InputData;
      expect(movedInput.currentX).toBe(150);
      expect(movedInput.currentY).toBe(150);
    });

    it('should invoke onEnd callback on touch end', () => {
      const onEnd = vi.fn();
      manager.onEnd(onEnd);

      // Start a touch
      const startEvent = {
        changedTouches: [{ identifier: 1, clientX: 100, clientY: 100 }],
      } as unknown as TouchEvent;
      manager.handleTouchStart(startEvent);

      // End it
      const endEvent = {
        changedTouches: [{ identifier: 1, clientX: 100, clientY: 100 }],
      } as unknown as TouchEvent;
      manager.handleTouchEnd(endEvent);

      expect(onEnd).toHaveBeenCalledOnce();
      expect(manager.hasInput(1)).toBe(false);
    });

    it('should support method chaining for callbacks', () => {
      const onStart = vi.fn();
      const onMove = vi.fn();
      const onEnd = vi.fn();

      const result = manager.onStart(onStart).onMove(onMove).onEnd(onEnd);

      expect(result).toBe(manager);
    });
  });

  describe('Touch Events', () => {
    it('should only process changedTouches on touchend', () => {
      const onEnd = vi.fn();
      manager.onEnd(onEnd);

      // Start two touches
      const startEvent = {
        changedTouches: [
          { identifier: 1, clientX: 100, clientY: 100 },
          { identifier: 2, clientX: 200, clientY: 200 },
        ],
      } as unknown as TouchEvent;
      manager.handleTouchStart(startEvent);

      // End only touch 1
      const endEvent = {
        changedTouches: [{ identifier: 1, clientX: 100, clientY: 100 }],
      } as unknown as TouchEvent;
      manager.handleTouchEnd(endEvent);

      expect(onEnd).toHaveBeenCalledOnce();
      expect(manager.hasInput(1)).toBe(false);
      expect(manager.hasInput(2)).toBe(true); // Touch 2 still active
    });

    it('should ignore touchmove for untracked touches', () => {
      const onMove = vi.fn();
      manager.onMove(onMove);

      // Move without start
      const moveEvent = {
        changedTouches: [{ identifier: 99, clientX: 150, clientY: 150 }],
      } as unknown as TouchEvent;
      manager.handleTouchMove(moveEvent);

      expect(onMove).not.toHaveBeenCalled();
    });
  });

  describe('Release Methods', () => {
    it('should release specific input by identifier', () => {
      const onEnd = vi.fn();
      manager.onEnd(onEnd);

      const event = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 200,
      });
      manager.handlePointerDown(event);

      manager.release(1);

      expect(onEnd).toHaveBeenCalledOnce();
      expect(manager.hasInput(1)).toBe(false);
    });

    it('should release all inputs', () => {
      const onEnd = vi.fn();
      manager.onEnd(onEnd);

      // Add multiple inputs
      manager.handlePointerDown(
        new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
      );
      manager.handlePointerDown(
        new PointerEvent('pointerdown', { pointerId: 2, clientX: 0, clientY: 0 })
      );

      manager.releaseAll();

      expect(onEnd).toHaveBeenCalledTimes(2);
      expect(manager.activeInputs.size).toBe(0);
    });

    it('should not call onEnd for non-existent release', () => {
      const onEnd = vi.fn();
      manager.onEnd(onEnd);

      manager.release(999);

      expect(onEnd).not.toHaveBeenCalled();
    });
  });

  describe('Zombie Cleanup (nipplejs #151)', () => {
    it('should release zombie inputs after timeout', () => {
      const onEnd = vi.fn();
      manager.onEnd(onEnd);

      const event = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 200,
      });
      manager.handlePointerDown(event);

      // Advance time past ZOMBIE_TIMEOUT
      vi.advanceTimersByTime(InputManager.ZOMBIE_TIMEOUT + 100);

      manager.checkZombies();

      expect(onEnd).toHaveBeenCalledOnce();
      expect(manager.hasInput(1)).toBe(false);
    });

    it('should not release active inputs before timeout', () => {
      const onEnd = vi.fn();
      manager.onEnd(onEnd);

      const event = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 200,
      });
      manager.handlePointerDown(event);

      // Advance time but not past timeout
      vi.advanceTimersByTime(InputManager.ZOMBIE_TIMEOUT - 100);

      manager.checkZombies();

      expect(onEnd).not.toHaveBeenCalled();
      expect(manager.hasInput(1)).toBe(true);
    });

    it('should have ZOMBIE_TIMEOUT of 1000ms', () => {
      expect(InputManager.ZOMBIE_TIMEOUT).toBe(1000);
    });
  });

  describe('Clear and Destroy', () => {
    it('should clear all inputs without callbacks', () => {
      const onEnd = vi.fn();
      manager.onEnd(onEnd);

      manager.handlePointerDown(
        new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
      );

      manager.clear();

      expect(onEnd).not.toHaveBeenCalled();
      expect(manager.activeInputs.size).toBe(0);
    });

    it('should destroy and remove all callbacks', () => {
      const onEnd = vi.fn();
      manager.onEnd(onEnd);

      manager.handlePointerDown(
        new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
      );

      manager.destroy();

      // Try to trigger callback after destroy
      manager.release(1);

      expect(onEnd).not.toHaveBeenCalled();
      expect(manager.activeInputs.size).toBe(0);
    });
  });

  describe('Feature Detection', () => {
    it('should have static supportsPointer getter', () => {
      // In jsdom, PointerEvent should exist
      expect(typeof InputManager.supportsPointer).toBe('boolean');
    });
  });
});
