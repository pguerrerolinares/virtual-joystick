# Virtual Joystick

Web Components library for mobile game touch controls.

## Installation

```bash
npm install virtual-joystick
# or
bun add virtual-joystick
```

## Quick Start

```html
<script type="module">
  import { registerAll } from 'virtual-joystick';
  registerAll();
</script>

<virtual-joystick mode="static" theme="modern" size="120"></virtual-joystick>
```

## Components

### `<virtual-joystick>`

Touch joystick control with multiple modes and themes.

```html
<virtual-joystick
  mode="static"
  theme="modern"
  size="100"
  threshold="0.1"
  shape="circle"
></virtual-joystick>
```

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | `static` \| `semi` \| `dynamic` | `dynamic` | Joystick behavior mode |
| `theme` | `modern` \| `custom` | `modern` | Visual theme |
| `size` | `number` | `100` | Size in pixels (validated: must be > 0) |
| `threshold` | `number` | `0.1` | Deadzone 0-1 (validated: clamped to range) |
| `shape` | `circle` \| `square` | `circle` | Boundary shape |
| `lock-x` | `boolean` | `false` | Lock X axis |
| `lock-y` | `boolean` | `false` | Lock Y axis |
| `catch-distance` | `number` | `50` | Distance to catch joystick in semi mode |
| `no-rest` | `boolean` | `false` | Keep nub position on release (don't return to center) |
| `data-only` | `boolean` | `false` | No DOM rendering, events only |

**Events:**

- `joystick-start` - Touch started
- `joystick-move` - Position updated
- `joystick-end` - Touch ended

**Event Data (joystick-move):**

```typescript
interface JoystickMoveData {
  identifier: number;
  position: { x: number; y: number };  // -1 to 1
  rawPosition: { x: number; y: number }; // pixels
  force: number;  // 0 to 1
  distance: number;
  angle: { radian: number; degree: number };
  compass: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | '';
  vector: { x: number; y: number };
  timestamp: number;
}
```

### `<virtual-action-button>`

Simple press/release button for game actions.

```html
<virtual-action-button size="64" theme="modern">
  <span>Jump</span>
</virtual-action-button>
```

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `size` | `number` | `64` | Button size in pixels |
| `theme` | `modern` \| `custom` | `modern` | Visual theme |
| `icon` | `string` | `''` | Icon identifier |

**Events:**

- `button-press` - Button pressed (includes `timestamp`)
- `button-release` - Button released (includes `timestamp`, `duration`)

## Modes

| Mode | Description | Positioning |
|------|-------------|-------------|
| `static` | Fixed position, always visible | `relative` |
| `dynamic` | Appears at touch location, disappears on release | `fixed` (viewport) |
| `semi` | Stays at last position, can be "caught" if touch is within `catch-distance` | `absolute` (scrolls with page) |

## Dataset Polling (Alternative to Events)

For game loops that prefer polling over events, the joystick exposes its state via `dataset` attributes:

```javascript
// Game loop approach - poll the joystick state
function gameLoop() {
  const joystick = document.querySelector('virtual-joystick');

  // Read current state directly (no event listener needed)
  const x = parseFloat(joystick.dataset.x);        // -1 to 1
  const y = parseFloat(joystick.dataset.y);        // -1 to 1
  const force = parseFloat(joystick.dataset.force); // 0 to 1
  const compass = joystick.dataset.compass;        // 'n', 'ne', 'e', etc.
  const degree = parseFloat(joystick.dataset.degree); // 0-360

  // Track direction changes
  const capture = joystick.dataset.capture;  // Newly activated directions
  const release = joystick.dataset.release;  // Just released directions

  requestAnimationFrame(gameLoop);
}
```

**Dataset attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-x` | `string` | Normalized X position (-1 to 1) |
| `data-y` | `string` | Normalized Y position (-1 to 1) |
| `data-force` | `string` | Force magnitude (0 to 1) |
| `data-compass` | `string` | Simple direction: `n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw`, or empty |
| `data-degree` | `string` | Angle in degrees (0-360) |
| `data-capture` | `string` | Characters from compass that were just activated |
| `data-release` | `string` | Characters from compass that were just released |

## Themes

### Modern (default)

Clean CSS-based design with gradients and shadows.

### Custom

Minimal styles, fully customizable via CSS custom properties.

## CSS Custom Properties

### Joystick

```css
virtual-joystick {
  --vj-size: 100px;
  --vj-nub-ratio: 0.5;
  --vj-rest-opacity: 0.5;
  --vj-active-opacity: 1;
  --vj-transition: 0.15s ease-out;

  /* Custom theme only */
  --vj-pad-bg: rgba(255, 255, 255, 0.1);
  --vj-pad-border: 2px solid rgba(255, 255, 255, 0.3);
  --vj-pad-shadow: none;
  --vj-pad-radius: 50%;
  --vj-nub-bg: linear-gradient(135deg, #4a90d9, #357abd);
  --vj-nub-border: 2px solid rgba(255, 255, 255, 0.4);
  --vj-nub-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  --vj-nub-radius: 50%;
}
```

### Action Button

```css
virtual-action-button {
  --vab-size: 64px;
  --vab-color: #e74c3c;
  --vab-bg: linear-gradient(...);
  --vab-border: 2px solid rgba(255, 255, 255, 0.4);
  --vab-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  --vab-radius: 50%;
}
```

## CSS Parts (Shadow DOM Styling)

Style joystick internals from outside using `::part()`:

```css
/* Style the container */
virtual-joystick::part(container) {
  filter: drop-shadow(0 0 10px blue);
}

/* Style the pad (base) */
virtual-joystick::part(pad) {
  background: radial-gradient(circle, #333, #111);
  border: 3px solid gold;
}

/* Style the nub (handle) */
virtual-joystick::part(nub) {
  background: crimson;
  box-shadow: 0 0 20px red;
}
```

**Available parts:**

| Part | Description |
|------|-------------|
| `container` | The outer wrapper element |
| `pad` | The circular/square base |
| `nub` | The movable handle |

## Framework Integration

### Vanilla JS

```javascript
import { VirtualJoystickElement } from 'virtual-joystick';

VirtualJoystickElement.register();

const joystick = document.querySelector('virtual-joystick');
joystick.addEventListener('joystick-move', (e) => {
  console.log(e.detail.position);
});
```

### React

```tsx
import { useEffect, useRef } from 'react';
import { registerAll } from 'virtual-joystick';

registerAll();

function Game() {
  const joystickRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = joystickRef.current;
    const handler = (e: CustomEvent) => {
      console.log(e.detail.position);
    };
    el?.addEventListener('joystick-move', handler);
    return () => el?.removeEventListener('joystick-move', handler);
  }, []);

  return <virtual-joystick ref={joystickRef} mode="static" />;
}
```

### Vue

```vue
<script setup>
import { onMounted } from 'vue';
import { registerAll } from 'virtual-joystick';

onMounted(() => {
  registerAll();
});

function onMove(e) {
  console.log(e.detail.position);
}
</script>

<template>
  <virtual-joystick mode="static" @joystick-move="onMove" />
</template>
```

### Angular

```typescript
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { registerAll } from 'virtual-joystick';

@Component({
  selector: 'app-game',
  template: `<virtual-joystick mode="static" (joystick-move)="onMove($event)"></virtual-joystick>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GameComponent implements OnInit {
  ngOnInit() {
    registerAll();
  }

  onMove(e: CustomEvent) {
    console.log(e.detail.position);
  }
}
```

## Robustness Features

Fixes for common issues found in similar libraries (nipplejs):

| Feature | Description |
|---------|-------------|
| **CSS Transform Compensation** | Correct positioning even with scaled/rotated parents (with singular matrix protection) |
| **Multi-touch Support** | Proper touch identifier tracking per instance with type prefixes |
| **iOS Safari Fixes** | No zoom on long-press, no callout menu |
| **Firefox Android Fixes** | No freeze with multiple joysticks |
| **RAF Batching** | Low CPU usage during continuous movement |
| **Visibility Change Handler** | Singleton handler auto-releases all inputs on tab switch/app background |
| **Lazy Shadow DOM** | No DOM overhead in data-only mode |
| **Input Validation** | Graceful fallback for invalid attribute values |

## Browser Support

- Chrome 77+
- Firefox 63+
- Safari 14.1+
- Edge 79+

Requires:
- Custom Elements v1
- Shadow DOM
- Constructable Stylesheets

## License

MIT
