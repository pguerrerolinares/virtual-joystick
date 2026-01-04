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
  theme="pixel-art"
  size="100"
  threshold="0.1"
  shape="circle"
></virtual-joystick>
```

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | `static` \| `semi` \| `dynamic` | `dynamic` | Joystick behavior mode |
| `theme` | `modern` \| `pixel-art` \| `custom` | `modern` | Visual theme |
| `size` | `number` | `100` | Size in pixels |
| `threshold` | `number` | `0.1` | Deadzone (0-1) |
| `shape` | `circle` \| `square` | `circle` | Boundary shape |
| `lock-x` | `boolean` | `false` | Lock X axis |
| `lock-y` | `boolean` | `false` | Lock Y axis |
| `catch-distance` | `number` | `50` | Distance to catch joystick in semi mode |

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
  direction: {
    x: 'left' | 'right' | 'center';
    y: 'up' | 'down' | 'center';
    angle: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
  };
  vector: { x: number; y: number };
  timestamp: number;
}
```

### `<virtual-action-button>`

Simple press/release button.

```html
<virtual-action-button size="64" theme="modern"></virtual-action-button>
```

**Events:**

- `button-press` - Button pressed
- `button-release` - Button released (includes `duration`)

### `<virtual-charge-button>`

Hold to charge, release to activate.

```html
<virtual-charge-button
  size="64"
  charge-time="800"
  show-percentage
></virtual-charge-button>
```

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `charge-time` | `number` | `800` | Time to fully charge (ms) |
| `show-percentage` | `boolean` | `false` | Show percentage text |
| `min-charge` | `number` | `0` | Minimum charge to activate (0-100) |

**Events:**

- `charge-start` - Charging started
- `charge-update` - Charge percentage updated
- `charge-release` - Released (includes `percent`, `activated`)

## Modes

| Mode | Description |
|------|-------------|
| `static` | Fixed position, always visible |
| `dynamic` | Appears at touch location, disappears on release |
| `semi` | Stays at last position, can be "caught" if touch is within `catch-distance` |

## Themes

### Modern (default)

Clean CSS-based design with gradients and shadows.

### Pixel Art

Retro 8-bit style with SVG sprites.

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

### Charge Button

```css
virtual-charge-button {
  --vcb-size: 64px;
  --vcb-color: #27ae60;
  --vcb-bg: linear-gradient(...);
  --vcb-border: 2px solid rgba(255, 255, 255, 0.4);
  --vcb-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  --vcb-radius: 50%;
  --vcb-ring-width: 4px;
  --vcb-ring-track: rgba(255, 255, 255, 0.2);
}
```

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
import { Component, OnInit } from '@angular/core';
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
