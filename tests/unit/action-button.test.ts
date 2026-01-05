import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualActionButtonElement } from '../../src/components/action-button/action-button.element';

describe('VirtualActionButtonElement', () => {
  let element: VirtualActionButtonElement;

  beforeEach(() => {
    // Register the component if not already registered
    VirtualActionButtonElement.register();
    element = document.createElement('virtual-action-button') as VirtualActionButtonElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Component Creation', () => {
    it('should create element with shadow DOM', () => {
      expect(element.shadowRoot).toBeDefined();
      expect(element.shadowRoot?.mode).toBe('open');
    });

    it('should render button element in shadow DOM', () => {
      const button = element.shadowRoot?.querySelector('.button');
      expect(button).toBeDefined();
      expect(button?.getAttribute('role')).toBe('button');
    });

    it('should have correct tagName', () => {
      expect(VirtualActionButtonElement.tagName).toBe('virtual-action-button');
    });
  });

  describe('Default Attributes', () => {
    it('should have default theme of modern', () => {
      expect(element.theme).toBe('modern');
    });

    it('should have default size of 64', () => {
      expect(element.size).toBe(64);
    });

    it('should have empty icon by default', () => {
      expect(element.icon).toBe('');
    });
  });

  describe('Attribute Reflection', () => {
    it('should reflect theme attribute', () => {
      element.theme = 'custom';
      expect(element.getAttribute('theme')).toBe('custom');
    });

    it('should reflect size attribute', () => {
      element.size = 100;
      expect(element.getAttribute('size')).toBe('100');
    });

    it('should reflect icon attribute', () => {
      element.icon = 'jump';
      expect(element.getAttribute('icon')).toBe('jump');
    });
  });

  describe('Size Updates', () => {
    it('should update CSS variable when size changes', () => {
      element.size = 80;
      const button = element.shadowRoot?.querySelector('.button') as HTMLElement;
      expect(button?.style.getPropertyValue('--vab-size')).toBe('80px');
    });
  });

  describe('Events', () => {
    it('should emit button-press on pointerdown', async () => {
      const pressHandler = vi.fn();
      element.addEventListener('button-press', pressHandler);

      const event = new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
      });
      element.dispatchEvent(event);

      expect(pressHandler).toHaveBeenCalledOnce();
      expect(pressHandler.mock.calls[0][0].detail.timestamp).toBeDefined();
    });

    it('should emit button-release on pointerup with duration', async () => {
      const releaseHandler = vi.fn();
      element.addEventListener('button-release', releaseHandler);

      // First press
      const downEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
      });
      element.dispatchEvent(downEvent);

      // Wait a bit for duration
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Then release
      const upEvent = new PointerEvent('pointerup', {
        bubbles: true,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
      });
      document.dispatchEvent(upEvent);

      expect(releaseHandler).toHaveBeenCalledOnce();
      expect(releaseHandler.mock.calls[0][0].detail.duration).toBeGreaterThan(0);
    });

    it('should add pressed class on press', () => {
      const downEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
      });
      element.dispatchEvent(downEvent);

      const button = element.shadowRoot?.querySelector('.button');
      expect(button?.classList.contains('pressed')).toBe(true);
    });

    it('should remove pressed class on release', () => {
      // Press
      const downEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
      });
      element.dispatchEvent(downEvent);

      // Release
      const upEvent = new PointerEvent('pointerup', {
        bubbles: true,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
      });
      document.dispatchEvent(upEvent);

      const button = element.shadowRoot?.querySelector('.button');
      expect(button?.classList.contains('pressed')).toBe(false);
    });

    it('should ignore second press while already pressed', () => {
      const pressHandler = vi.fn();
      element.addEventListener('button-press', pressHandler);

      // First press
      element.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // Second press (should be ignored)
      element.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 2,
          clientX: 60,
          clientY: 60,
        })
      );

      expect(pressHandler).toHaveBeenCalledOnce();
    });
  });

  describe('Lifecycle', () => {
    it('should clean up on disconnect', () => {
      // Press to ensure listeners are active
      element.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
          clientY: 50,
        })
      );

      // Remove element
      element.remove();

      // Should not throw when dispatching events after removal
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

  describe('Static Registration', () => {
    it('should register component', () => {
      expect(customElements.get('virtual-action-button')).toBeDefined();
    });

    it('should not re-register if already defined', () => {
      // Should not throw
      expect(() => VirtualActionButtonElement.register()).not.toThrow();
    });
  });
});
