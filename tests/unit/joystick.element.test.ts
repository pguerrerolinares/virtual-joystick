import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VirtualJoystickElement } from '../../src/components/joystick/joystick.element';

describe('VirtualJoystickElement', () => {
  beforeEach(() => {
    VirtualJoystickElement.register();
  });

  afterEach(() => {
    // Clean up any elements added to body
    document.body.innerHTML = '';
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
});
