# nipplejs Issues Reference

Análisis completo de los issues de [nipplejs](https://github.com/yoannmoinet/nipplejs) para evitar los mismos problemas en virtual-joystick.

**Fuente:** GitHub API - Extraído automáticamente
**Fecha:** 2026-01-05

---

## Estadísticas

| Métrica | Valor |
|---------|-------|
| **Total Issues** | 142 (excluyendo PRs) |
| **Abiertos** | 33 |
| **Cerrados** | 109 |
| **Bugs** | 57 |
| **Feature Requests** | 20 |
| **Help Wanted** | 18 |
| **Questions** | 9 |

### Issues más discutidos (por comentarios)
| # | Título | Comentarios |
|---|--------|-------------|
| #80 | Rename this library? | 19 |
| #34 | Chrome dev issues | 15 |
| #31 | Joystick gets stuck | 15 |
| #21 | TypeScript definitions | 14 |
| #68 | ES6 module support | 14 |
| #20 | Multiple static joysticks | 14 |
| #16 | Static/semi mode touch issues | 13 |
| #39 | Mouse coords offset | 12 |
| #38 | Simultaneous touch events | 10 |
| #151 | Dynamic joysticks freeze | 9 |

---

## Bugs Criticos (MUST FIX)

### #231 - Firefox Android: Static Joystick Freezes
**Estado:** Open | **Creado:** 2025-08-29

> El primer joystick estático se congela cuando se suelta el segundo durante uso con dos manos en Firefox Android.

**Causa raíz:** `preventDefault()` en `touchend` causa bugs en Firefox Android.

**Solución:**
```typescript
handleTouchEnd(event: TouchEvent): void {
  // [NO] NUNCA hacer esto en touchend
  // event.preventDefault();

  for (const touch of Array.from(event.changedTouches)) {
    this.release(touch.identifier);
  }
}
```

**Estado en virtual-joystick:** [OK] Mitigado

---

### #222 - Click Location Mismatch (CSS Transforms)
**Estado:** Open | **Creado:** 2025-04-10 | **Comentarios:** 1

> La posición del joystick no coincide con donde se hace click. El problema desaparece al hacer resize.

**Causa raíz:** CSS transforms (scale, rotate, translate) no compensados en cálculo de coordenadas.

**Solución:**
```typescript
function getLocalPosition(clientX: number, clientY: number, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const transform = getComputedStyle(element).transform;

  if (transform === 'none') {
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  // Invertir matriz de transformación
  const matrix = new DOMMatrix(transform).inverse();
  const point = new DOMPoint(clientX - rect.left, clientY - rect.top);
  const transformed = point.matrixTransform(matrix);

  return { x: transformed.x, y: transformed.y };
}
```

**Estado en virtual-joystick:** [OK] Implementado en `transform-utils.ts` e integrado en `joystick.element.ts`

---

### #214 - Multi-touch Issue on Swipe
**Estado:** Open | **Creado:** 2023-09-08

> Usar un dedo para movimiento y otro para rotación. El segundo dedo deja spots azules al hacer swipe rápido.

**Causa raíz:** Procesamiento incorrecto de `changedTouches`.

**Solución:**
```typescript
// [OK] Procesar TODOS los changedTouches
handleTouchEnd(event: TouchEvent): void {
  for (const touch of Array.from(event.changedTouches)) {
    if (this.activeInputs.has(touch.identifier)) {
      this.release(touch.identifier);
    }
  }
}

// [NO] NO solo el primero
// const touch = event.changedTouches[0];
```

**Estado en virtual-joystick:** [OK] Implementado

---

### #189 - Can't Use Both Joysticks Simultaneously
**Estado:** Open | **Creado:** 2022-06-09

> No se pueden usar dos joysticks a la vez en tablet Dell 7320 con Ubuntu.

**Causa raíz:** Touch identifiers no trackeados correctamente por instancia.

**Solución:** Cada instancia de joystick debe trackear solo SU touch identifier.

**Estado en virtual-joystick:** [OK] Implementado con `InputManager`

---

### #185 - iOS Safari Zoom on Long-press
**Estado:** Open | **Creado:** 2022-04-19 | **Comentarios:** 1

> iOS Safari muestra zoom al mantener presionado.

**Solución CSS:**
```css
:host {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-text-size-adjust: none;
}
```

**Solución JS:**
```typescript
handleTouchStart(event: TouchEvent): void {
  event.preventDefault(); // Previene zoom en iOS
  // ...
}
```

**Estado en virtual-joystick:** [OK] Implementado

---

### #175 - Joystick with Other Elements
**Estado:** Open | **Creado:** 2022-02-11 | **Comentarios:** 2

> Cuando se toca el joystick, los eventos touch de otros elementos no funcionan.

**Causa raíz:** Event bubbling no controlado.

**Solución:**
```typescript
handleTouchStart(event: TouchEvent): void {
  event.preventDefault();
  event.stopPropagation(); // [OK] Evitar interferencia
  // ...
}
```

**Estado en virtual-joystick:** [OK] Implementado

---

### #151 - Dynamic Joysticks Freeze on Fast Interaction
**Estado:** Open | **Creado:** 2020-09-08 | **Comentarios:** 9

> Joysticks dinámicos se congelan con interacción rápida.

**Causa raíz (de comentarios):**
> "I found that problem is exactly same as #94, but for pointer events. Affected devices sometimes does not send `pointerremove` event."

**Solución implementada:**
```typescript
// InputManager trackea última actividad por input
readonly #lastActivityTime = new Map<number, number>();
static readonly ZOMBIE_TIMEOUT = 1000; // ms

// Llamar periódicamente (en RAF loop)
checkZombies(): void {
  const now = Date.now();
  for (const [id, lastTime] of this.#lastActivityTime) {
    if (now - lastTime > InputManager.ZOMBIE_TIMEOUT) {
      this.release(id);
    }
  }
}
```

**Estado en virtual-joystick:** Implementado en `input-manager.ts`. El metodo `checkZombies()` existe pero NO se llama en RAF loop (causaba race conditions). En su lugar, se usa singleton visibility change handler que libera todos los inputs cuando la pagina pierde foco.

---

### #139 - Joystick Locked on Y Returns Wrong Angle
**Estado:** Open | **Creado:** 2020-03-09

> Cuando el joystick está bloqueado en Y, sigue retornando ángulo del eje X.

**Causa raíz:** Ángulo calculado ANTES de aplicar locks.

**Solución:**
```typescript
function calculateAngle(x: number, y: number, lockX: boolean, lockY: boolean) {
  // [OK] Aplicar locks PRIMERO
  const effectiveX = lockX ? 0 : x;
  const effectiveY = lockY ? 0 : y;

  if (effectiveX === 0 && effectiveY === 0) {
    return { radian: 0, degree: 0 };
  }

  const radian = Math.atan2(effectiveY, effectiveX);
  const degree = ((radian * 180) / Math.PI + 360) % 360;

  return { radian, degree };
}
```

**Estado en virtual-joystick:** [OK] Implementado

---

### #130 - Joystick Stuck on Right-Click Outside Document
**Estado:** Open | **Creado:** 2019-11-23 | **Comentarios:** 1

> Joystick se queda atascado si haces right-click fuera del documento.

**Solución:**
```typescript
// Escuchar eventos en document, no solo en el elemento
document.addEventListener('pointerup', this.handlePointerUp);
document.addEventListener('pointercancel', this.handlePointerUp);

// Y limpiar en visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    this.releaseAll();
  }
});
```

**Estado en virtual-joystick:** [OK] Implementado

---

### #126 - iOS Failure for New Devices
**Estado:** Open | **Creado:** 2019-10-02 | **Comentarios:** 4

> En iOS 13.1.3, los nipples se congelan en Safari y Chrome del iPhone, pero funciona en Mac.

**Causa raíz:** Cambios en iOS 13 que afectan touch events.

**Estado en virtual-joystick:** [PENDIENTE] Requiere testing en iOS moderno

---

### #122 - Joystick Unresponsive with Pixi.js on iOS 13
**Estado:** Open | **Creado:** 2019-09-25 | **Comentarios:** 5

> Joystick no responde cuando se usa junto a Pixi.js en iOS 13.

**Causa raíz:** Conflicto de pointer events entre nipplejs y Pixi.js.

**Estado en virtual-joystick:** [PENDIENTE] Requiere testing con canvas libraries

---

### #113 - Application Freezes on iOS with 2 Instances
**Estado:** Open | **Creado:** 2019-06-14 | **Comentarios:** 3

> La app se congela en iOS cuando hay 2 instancias de joystick (una cacheada con Vue keep-alive).

**Solución:**
```typescript
// Limpiar completamente al destruir
disconnectedCallback(): void {
  this.cleanup();
  this.inputManager.destroy();
}
```

**Estado en virtual-joystick:** [OK] Implementado en `disconnectedCallback`

---

## Bugs de Performance

### #168 - High CPU Usage
**Estado:** Closed

> Alto uso de CPU durante el movimiento del joystick.

**Causa raíz:** Emitir eventos en cada touchmove sin batching.

**Solución:**
```typescript
#animationFrameId: number | null = null;
#pendingData: MoveData | null = null;

handleTouchMove(event: TouchEvent): void {
  this.#pendingData = this.calculate(event);

  // RAF batching - máximo 1 emisión por frame
  if (this.#animationFrameId === null) {
    this.#animationFrameId = requestAnimationFrame(() => {
      if (this.#pendingData) {
        this.emit(this.#pendingData);
      }
      this.#animationFrameId = null;
    });
  }
}
```

**Estado en virtual-joystick:** [OK] Implementado

---

## Bugs de Compatibilidad por Plataforma

### iOS Safari
| # | Título | Estado |
|---|--------|--------|
| #185 | Zoom on long-press | [OK] Mitigado con CSS |
| #174 | Frozen on iOS 15.3 | Closed |
| #126 | Failure on iOS 13+ | [PENDIENTE] Monitorear |
| #122 | Unresponsive with Pixi.js | [PENDIENTE] Monitorear |
| #113 | Freeze with 2 instances | [OK] Mitigado |
| #94 | Gets stuck in dynamic mode | Closed |
| #93 | Gets stuck on status bar | Closed |
| #33 | Gets stuck on iPhone | Closed |

### Firefox Android
| # | Título | Estado |
|---|--------|--------|
| #231 | Static joystick freezes | [OK] Mitigado |
| #158 | Two joysticks freeze | Closed |

### Chrome
| # | Título | Estado |
|---|--------|--------|
| #34 | Chrome dev/Chromium issues | Closed (muy antiguo) |

### Frameworks
| # | Framework | Problema | Estado |
|---|-----------|----------|--------|
| #165 | Vue/Nuxt | Reference Error en 0.9.0 | Open |
| #181 | Svelte | Wrong location | Closed |
| #120 | Vue.js | Reference fails | Closed |
| #95 | Ionic/Angular | Build issues | Closed |
| #148 | Vue/Nuxt | Integration example needed | Open |

---

## Feature Requests

### Alta Prioridad (más solicitados)

| # | Título | Estado | Comentarios |
|---|--------|--------|-------------|
| #213 | ESM build | Open | 0 |
| #172 | Disable joystick movement | Open | 0 |
| #171 | Only count touches on press | Open | 0 |
| #104 | Square shape for joystick | Closed | 1 |
| #99 | TypeScript definitions | Closed | 2 |
| #42 | Lock axis movement | Closed | 6 |

### Implementados en virtual-joystick
- ESM + UMD build
- TypeScript nativo
- Lock X/Y axis
- Square shape
- Static/Semi/Dynamic modes
- Catch distance para semi mode
- Rest joystick option (no-rest attribute)
- Data only mode (lazy Shadow DOM)

### Pendientes/Opcionales
- [TODO] Disable attribute
- [TODO] Force Touch / Pressure
- [TODO] Programmatic position update

---

## Workarounds de la Comunidad

### Zombie Touch Cleanup (de #151)
El metodo `checkZombies()` existe en InputManager para limpiar inputs que no recibieron
evento de fin (algunos dispositivos no envian `pointerremove`). Sin embargo, NO se llama
en el RAF loop porque causaba race conditions. En su lugar, se usa el singleton
visibility change handler.

```typescript
// InputManager.checkZombies() - disponible para llamar manualmente si necesario
checkZombies(): void {
  const now = Date.now();
  for (const [id, lastTime] of this.#lastActivityTime) {
    if (now - lastTime > InputManager.ZOMBIE_TIMEOUT) {
      this.release(id);
    }
  }
}
```

### Pointer Events Priority (de #151)
```typescript
// Usar Pointer Events si estan disponibles
// Son mas robustos que Touch Events
if ('PointerEvent' in window) {
  // pointerdown/pointermove/pointerup/pointercancel
} else {
  // touchstart/touchmove/touchend + mousedown/mousemove/mouseup
}
```

### Force Release on Visibility Change - Singleton (ACTUALIZADO)
```typescript
// InputManager usa un singleton para visibilitychange
// Solo se registra UN listener global para todas las instancias
static #visibilityInitialized = false;
static #instances = new Set<InputManager>();

static #initVisibilityHandler(): void {
  if (this.#visibilityInitialized) return;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      for (const instance of this.#instances) {
        instance.releaseAll();
      }
    }
  });

  this.#visibilityInitialized = true;
}
```

---

## Tests Requeridos

Basados en los issues reportados, virtual-joystick debe incluir tests para:

### Multi-touch
- [ ] Dos joysticks funcionan simultáneamente
- [ ] Swipe rápido no deja joysticks fantasma
- [ ] Release de un joystick no afecta al otro

### iOS Safari
- [ ] No zoom en long-press
- [ ] No callout menu
- [ ] Funciona con iOS 15+
- [ ] Funciona junto a canvas (Pixi.js, Three.js)

### Firefox Android
- [ ] No freeze en modo estático con dos joysticks
- [ ] touchend sin preventDefault funciona correctamente

### CSS Transforms - [OK] Tests añadidos
- [x] Posición correcta con `scale()`
- [x] Posición correcta con `rotate()`
- [x] Posición correcta con `translate()`
- [ ] Posición correcta con transform complejo

### Performance
- [ ] CPU < 5% en idle
- [ ] CPU < 15% durante uso continuo
- [ ] No memory leaks después de destroy

### Modos
- [ ] Static mode funciona
- [ ] Semi mode con catchDistance funciona
- [ ] Dynamic mode funciona
- [ ] dataOnly mode no causa errores

### Axis Lock
- [ ] lockX bloquea correctamente
- [ ] lockY bloquea correctamente
- [ ] Ángulo correcto cuando hay lock

### Shape
- [ ] Circle shape clampea correctamente
- [ ] Square shape clampea correctamente

### Lifecycle
- [ ] Cleanup completo en disconnectedCallback
- [ ] Múltiples instancias no interfieren
- [ ] Destroy no deja listeners huérfanos

---

## Analisis de Patrones

### Problemas más comunes
1. **Multi-touch** - 15+ issues relacionados
2. **iOS compatibility** - 10+ issues
3. **Position offset** - 8+ issues
4. **Joystick gets stuck** - 7+ issues
5. **CSS transform issues** - 5+ issues

### Causas raíz frecuentes
1. `preventDefault()` en lugares incorrectos
2. Touch identifiers mal gestionados
3. CSS transforms no compensados
4. Event listeners no limpiados
5. Race conditions en touch events rápidos

### Mejores practicas derivadas
1. Usar Pointer Events como primera opcion
2. NO `preventDefault()` en touchend
3. Trackear cada touch por identifier unico con prefijos de tipo
4. Usar RAF batching para eventos move
5. Limpiar TODO en disconnectedCallback
6. Compensar CSS transforms con DOMMatrix (con proteccion para matrices singulares)
7. Escuchar pointerup/mouseup en document
8. Manejar visibility change con singleton (un listener para todas las instancias)
9. Separar tracking de listeners para pointer y mouse (evita memory leaks)
10. Validar atributos numericos con valores por defecto seguros

---

## Bugs Adicionales Encontrados y Corregidos

Durante el desarrollo de virtual-joystick se identificaron y corrigieron bugs adicionales
no reportados en nipplejs:

| Bug | Causa | Solucion |
|-----|-------|----------|
| Memory leak en document listeners | Un solo boolean para pointer Y mouse | Booleans separados: `#pointerListenersAdded`, `#mouseListenersAdded` |
| Cleanup mismatch en ActionButton | Setup condicional, cleanup incondicional | Cleanup tambien condicional segun `supportsPointer` |
| Race condition en RAF + zombies | `checkZombies()` en RAF podia borrar input activo | Removido de RAF, usar visibility change |
| Collision touch.id=0 vs mouse=0 | Ambos usan identifier 0 | Prefijos: `pointer-X`, `touch-X`, `mouse-0` |
| Matriz singular en transform | DOMMatrix.inverse() falla | Try-catch + validacion de determinante |

---

## Referencias

- [nipplejs GitHub Issues](https://github.com/yoannmoinet/nipplejs/issues)
- [nipplejs Source Code](https://github.com/yoannmoinet/nipplejs/tree/master/src)
- [Touch Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Pointer Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [DOMMatrix MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix)

---

*Documento generado automáticamente el 2026-01-05 usando GitHub API.*
