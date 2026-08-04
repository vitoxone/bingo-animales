# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev        # Vite dev server en http://localhost:3000 (host: true, accesible en LAN/TV)
npm run build      # tsc -b (project references) + vite build → /dist
npm run preview    # Sirve el build de producción
npm run lint       # ESLint flat config, --max-warnings 0 (los warnings rompen el comando)
npm run format     # Prettier sobre src/**/*.{ts,tsx,css}
```

No hay framework de tests ni test runner instalado en el proyecto. Si se agregan tests hay que
instalar y configurar el runner primero (no asumir que existe Vitest/Jest).

Verificación de tipos aislada: `npx tsc -b` (usa `tsconfig.app.json` + `tsconfig.node.json`;
`tsconfig.json` es solo el archivo de referencias, sin `include` propio).

## Arquitectura

SPA client-side sin backend, sin router: `App.tsx` mantiene `currentPage: 'home' | 'game' | 'print'`
en `useState` y renderiza condicionalmente `Home` / `Game` / `Print` dentro de `PageTransition`
(Framer Motion `AnimatePresence`). Cualquier navegación nueva pasa por el callback `onNavigate`, no
por URLs.

### Dos contextos con alcances distintos

- **`SettingsContext`** envuelve toda la app en `App.tsx`. Estado persistido en `localStorage`
  (clave `bingo_animales_settings`, ver `src/utils/storage.ts`); `loadSettings()` hace merge sobre
  `defaultSettings`, así que agregar un campo nuevo a `Settings` es retrocompatible.
- **`BingoContext`** vive solo dentro de la página `Game` (`Game` monta `BingoProvider` alrededor de
  `GameInner`). Consecuencia importante: **salir de la página Game desmonta el provider y se pierde
  la partida en curso**. El estado del juego nunca se persiste.

### Máquina de estados del juego (`src/context/BingoContext.tsx`)

Es el archivo central. Un `useReducer` sobre `GameState { phase, deck, currentIndex, countdown }`
con fases `idle → countdown → showing → (paused) → finished`. El `deck` se genera una sola vez por
partida con `shuffle(ANIMALS)` (Fisher-Yates, no muta el original) y nunca se re-baraja; avanzar es
solo mover `currentIndex`.

El reducer es puro; **todos los timers y sonidos viven en `useEffect`s del provider**, coordinados
por `clearTimers()` (refs a `setInterval` del countdown y `setTimeout` del auto-avance). Al tocar
esta lógica, respetar el patrón: cada effect limpia sus timers al entrar y en el cleanup, para
evitar timers duplicados cuando cambian `phase`/`currentIndex`.

Los datos derivados (`currentAnimal`, `drawnAnimals`, `pendingAnimals`, `progress`) se calculan en
el provider a partir de `deck` + `currentIndex`; no duplicar ese cálculo en componentes.

Detalle a tener en cuenta: el reducer inicializa `countdown: 3` de forma literal en
`START_COUNTDOWN`/`SHOW_ANIMAL`/`NEXT_ANIMAL`, **ignorando `settings.countdownSeconds`**. Si hay que
respetar esa preferencia, el valor debe pasarse por la acción (el reducer no ve el contexto de
settings).

### Los 30 animales

`src/data/animals.ts` (~1400 líneas) es la única fuente de verdad: cada `Animal` lleva su SVG como
**string inline** (`viewBox="0 0 200 200"`), más `color`/`colorDark`. Los SVG se pintan con
`dangerouslySetInnerHTML` en `AnimalViewer`, `AnimalCard`, `Home` y `PDFGenerator` — es intencional,
el markup es local y confiable, no hay entrada de usuario ahí. Agregar o quitar animales cambia
automáticamente el tamaño del mazo, pero varios textos de UI dicen "30 animales" literalmente
(`Board.tsx`, `Game.tsx`, `Home.tsx`) y hay que actualizarlos a mano.

### Generación de PDF (`src/utils/pdf.ts`)

pdf-lib dibuja las cartillas con primitivas (rectángulos + texto): A4 de 595×842 pt, 4 cartillas por
página en grilla 2×2, cada cartilla con grilla 3×3 de animales y código `BA-0001`. **Los SVG no se
rasterizan en el PDF** — es una decisión deliberada para no depender de canvas/node-canvas; las
celdas muestran nombre y color. La vista previa en pantalla (`PDFGenerator.tsx`) sí muestra los SVG,
así que preview y PDF no coinciden visualmente por diseño. Opciones de cantidad: 1–100.

### Estilos

CSS Modules por componente (`X.module.css` junto a `X.tsx`) + design tokens globales en
`src/styles/variables.css` (colores, radios, sombras, tipografía, espaciado). Usar las variables CSS
en vez de valores hardcodeados. `src/styles/globals.css` trae el reset; `index.html` duplica un mini
reset inline para evitar FOUC.

### Teclado / Smart TV

`useKeyboard` es un listener global reutilizable, montado en dos lugares con `enabled` mutuamente
excluyente: `Board` cuando la partida está activa, `GameInner` solo en la pantalla final. Ignora
eventos originados en `INPUT`/`TEXTAREA`/`SELECT`. Teclas: `→`/`Enter`/`Espacio` siguiente, `←`
anterior, `p`/`Escape` pausa, `r` reanudar, `n` nueva partida, `f` pantalla completa.
`useFullscreen`/`utils/fullscreen.ts` incluyen los prefijos `webkit` y tragan los errores, porque
navegadores de TV e iframes bloquean la API.

## Convenciones

- Imports **relativos** en todo el código. Existe un alias `@ → /src` configurado en `vite.config.ts`
  y `tsconfig.app.json`, pero no se usa en ninguna parte; mantener el estilo relativo salvo que se
  migre todo.
- Un componente por carpeta, exportado con **named export** (`export function Board()`); la única
  excepción es `App.tsx` (default export).
- Comentarios de sección con el estilo `// ── Nombre ───` presente en todo el código.
- Textos de UI y nombres de animales en español; identificadores y comentarios en inglés.
- Prettier: comillas simples, `semi: true`, ancho 100, JSX con comillas dobles.

## Notas del repo

- No es un repositorio git.
- `build/` es un artefacto viejo de una configuración anterior; el output actual es `dist/`
  (`vite.config.ts`). Los `vite.config.ts.timestamp-*.mjs` en la raíz también son basura de Vite.
- El build hace chunking manual: `react`, `motion` (framer-motion) y `pdf` (pdf-lib) van a bundles
  separados; agregar una dependencia pesada implica evaluar si sumarla a `manualChunks`.
