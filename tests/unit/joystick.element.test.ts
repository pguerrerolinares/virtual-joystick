import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualJoystickElement } from '../../src/components/joystick/joystick.element';

describe('VirtualJoystickElement', () => {
  let originalRAF: typeof requestAnimationFrame;
  let originalCAF: typeof cancelAnimationFrame;

  beforeEach(() => {
    // Mock RAF/CAF to work synchronously
    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;

    globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      return setTimeout(() => cb(performance.now()), 0) as unknown as number;
    };
    globalThis.cancelAnimationFrame = (id: number): void => {
      clearTimeout(id);
    };

    VirtualJoystickElement.register();
  });

  afterEach(() => {
    // Clean up any elements added to body
    document.body.innerHTML = '';
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCAF;
  });

  it('should be defined', () => {
    const el = document.createElement('virtual-joystick');
    expect(el).toBeInstanceOf(VirtualJoystickElement);
  });

  it('should have shadow root after connecting', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    document.body.appendChild(el);
    expect(el.shadowRoot).toBeTruthy();
  });

  it('should have default mode of dynamic', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    expect(el.mode).toBe('dynamic');
  });

  it('should have default theme of modern', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    expect(el.theme).toBe('modern');
  });

  it('should have default size of 100', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    expect(el.size).toBe(100);
  });

  it('should have default threshold of 0.1', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    expect(el.threshold).toBe(0.1);
  });

  it('should have default shape of circle', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    expect(el.shape).toBe('circle');
  });

  it('should reflect mode attribute', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    el.mode = 'static';
    expect(el.getAttribute('mode')).toBe('static');
  });

  it('should reflect size attribute', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    el.size = 150;
    expect(el.getAttribute('size')).toBe('150');
  });

  it('should toggle lock-x attribute', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    expect(el.lockX).toBe(false);
    el.lockX = true;
    expect(el.hasAttribute('lock-x')).toBe(true);
    expect(el.lockX).toBe(true);
  });

  it('should toggle lock-y attribute', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    expect(el.lockY).toBe(false);
    el.lockY = true;
    expect(el.hasAttribute('lock-y')).toBe(true);
    expect(el.lockY).toBe(true);
  });

  it('should render pad and nub elements', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    document.body.appendChild(el);

    const pad = el.shadowRoot?.querySelector('.pad');
    const nub = el.shadowRoot?.querySelector('.nub');

    expect(pad).toBeTruthy();
    expect(nub).toBeTruthy();
  });

  it('should not render DOM when data-only is set', () => {
    const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
    el.setAttribute('data-only', '');
    document.body.appendChild(el);

    const container = el.shadowRoot?.querySelector('.container');
    expect(container).toBeFalsy();
  });

  describe('Events', () => {
    it('should emit joystick-start on pointerdown', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      const startHandler = vi.fn();
      el.addEventListener('joystick-start', startHandler);

      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      expect(startHandler).toHaveBeenCalledOnce();
      expect(startHandler.mock.calls[0][0].detail.identifier).toBe(1);
      expect(startHandler.mock.calls[0][0].detail.position).toBeDefined();
    });

    it('should emit joystick-end on pointerup', async () => {
      vi.useFakeTimers();

      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      const endHandler = vi.fn();
      el.addEventListener('joystick-end', endHandler);

      // Start
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // End
      document.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      expect(endHandler).toHaveBeenCalledOnce();
      expect(endHandler.mock.calls[0][0].detail.identifier).toBe(1);

      vi.useRealTimers();
    });

    it('should only track one input at a time', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      const startHandler = vi.fn();
      el.addEventListener('joystick-start', startHandler);

      // First touch
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // Second touch (should be ignored)
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 2,
          clientX: 100,
          clientY: 100,
        })
      );

      expect(startHandler).toHaveBeenCalledOnce();
    });
  });

  describe('Dataset Output (dondido pattern)', () => {
    it('should update dataset.x and dataset.y on move', () => {
      vi.useFakeTimers();

      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      el.mode = 'static';
      document.body.appendChild(el);

      // Start
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // Move
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerId: 1,
          clientX: 80,
          clientY: 50,
        })
      );

      // Trigger RAF
      vi.advanceTimersByTime(16);

      expect(el.dataset.x).toBeDefined();
      expect(el.dataset.y).toBeDefined();

      vi.useRealTimers();
    });

    it('should reset dataset on end', () => {
      vi.useFakeTimers();

      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      // Start
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // End
      document.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      expect(el.dataset.x).toBe('0');
      expect(el.dataset.y).toBe('0');
      expect(el.dataset.force).toBe('0');
      expect(el.dataset.compass).toBe('');

      vi.useRealTimers();
    });
  });

  describe('Axis Locking', () => {
    it('should apply lock-x when moving', () => {
      vi.useFakeTimers();

      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      el.lockX = true;
      document.body.appendChild(el);

      // Start at center
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // Move diagonally
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerId: 1,
          clientX: 100,
          clientY: 100,
        })
      );

      // Trigger RAF
      vi.advanceTimersByTime(16);

      // X should be locked to 0
      expect(el.dataset.x).toBe('0');

      vi.useRealTimers();
    });

    it('should apply lock-y when moving', () => {
      vi.useFakeTimers();

      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      el.lockY = true;
      document.body.appendChild(el);

      // Start at center
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // Move diagonally
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerId: 1,
          clientX: 100,
          clientY: 100,
        })
      );

      // Trigger RAF
      vi.advanceTimersByTime(16);

      // Y should be locked to 0
      expect(el.dataset.y).toBe('0');

      vi.useRealTimers();
    });
  });

  describe('Shape Clamping', () => {
    it('should have default shape of circle', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      expect(el.shape).toBe('circle');
    });

    it('should reflect shape attribute', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      el.shape = 'square';
      expect(el.getAttribute('shape')).toBe('square');
    });
  });

  describe('Threshold', () => {
    it('should filter small movements below threshold', () => {
      vi.useFakeTimers();

      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      el.threshold = 0.5; // High threshold
      document.body.appendChild(el);

      const moveHandler = vi.fn();
      el.addEventListener('joystick-move', moveHandler);

      // Start
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // Small move (below threshold)
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerId: 1,
          clientX: 52, // Very small movement
          clientY: 50,
        })
      );

      // Trigger RAF
      vi.advanceTimersByTime(16);

      // Position should be clamped to 0 due to threshold
      if (moveHandler.mock.calls.length > 0) {
        const moveData = moveHandler.mock.calls[0][0].detail;
        expect(moveData.position.x).toBe(0);
        expect(moveData.position.y).toBe(0);
      }

      vi.useRealTimers();
    });
  });

  describe('CSS Custom Properties', () => {
    it('should set --vj-size CSS variable', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      el.size = 150;
      document.body.appendChild(el);

      const container = el.shadowRoot?.querySelector('.container') as HTMLElement;
      expect(container?.style.getPropertyValue('--vj-size')).toBe('150px');
    });
  });

  describe('Part Attributes', () => {
    it('should expose container part', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      const container = el.shadowRoot?.querySelector('[part="container"]');
      expect(container).toBeTruthy();
    });

    it('should expose pad part', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      const pad = el.shadowRoot?.querySelector('[part="pad"]');
      expect(pad).toBeTruthy();
    });

    it('should expose nub part', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      const nub = el.shadowRoot?.querySelector('[part="nub"]');
      expect(nub).toBeTruthy();
    });
  });

  describe('Active Class', () => {
    it('should add active class on start', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      const container = el.shadowRoot?.querySelector('.container');
      expect(container?.classList.contains('active')).toBe(true);
    });

    it('should remove active class on end', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      // Start
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // End
      document.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      const container = el.shadowRoot?.querySelector('.container');
      expect(container?.classList.contains('active')).toBe(false);
    });
  });

  describe('Additional Attributes', () => {
    it('should have default catchDistance of 50', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      expect(el.catchDistance).toBe(50);
    });

    it('should reflect catchDistance attribute', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      el.catchDistance = 100;
      expect(el.getAttribute('catch-distance')).toBe('100');
    });

    it('should have restJoystick true by default', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      expect(el.restJoystick).toBe(true);
    });

    it('should toggle dataOnly attribute', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      expect(el.dataOnly).toBe(false);
      el.dataOnly = true;
      expect(el.hasAttribute('data-only')).toBe(true);
    });
  });

  describe('Lifecycle', () => {
    it('should clean up on disconnect', () => {
      const el = document.createElement('virtual-joystick') as VirtualJoystickElement;
      document.body.appendChild(el);

      // Start joystick
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // Remove element
      el.remove();

      // Should not throw when events are dispatched after removal
      expect(() => {
        document.dispatchEvent(
          new PointerEvent('pointerup', {
            bubbles: true,
            pointerId: 1,
            clientX: 50,
            clientY: 50,
          })
        );
      }).not.toThrow();
    });
  });
});
