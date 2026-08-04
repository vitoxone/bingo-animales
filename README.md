# 🎯 Bingo de Animales

Juego educativo de Bingo para niños con 30 animales, generador de cartillas PDF y soporte para Smart TV.

---

## Características

- **30 animales** en español con ilustraciones SVG originales y coloridas
- **Cuenta regresiva animada** (3-2-1) antes de cada animal
- **Modo manual y automático** con tiempos configurables
- **Historial en tiempo real** — animales sorteados y pendientes con barra de progreso
- **Generador de cartillas PDF** — hasta 100 cartillas (4 por página A4, grilla 3×3)
- **Confetti y efectos de sonido** sintetizados (sin archivos externos)
- **Smart TV / Control remoto** — navegación completa por teclado y flechas
- **Responsive** — Desktop, tablet, móvil, pantallas táctiles
- **Persistencia** — configuración guardada automáticamente en localStorage
- **Sin backend** — 100% client-side

---

## Instalación

```bash
npm install
```

---

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Genera build de producción optimizado en `/dist` |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Formatea el código con Prettier |

---

## Estructura del proyecto

```
src/
├── assets/
│   ├── animals/       # (reservado para archivos SVG externos futuros)
│   └── sounds/        # (reservado para archivos de audio futuros)
├── components/
│   ├── AnimalCard/    # Tarjeta pequeña de animal (historial / preview)
│   ├── AnimalViewer/  # Vista grande del animal sorteado
│   ├── Board/         # Tablero principal del juego
│   ├── BingoControls/ # Botones de control (anterior, siguiente, pausar...)
│   ├── Countdown/     # Cuenta regresiva animada
│   ├── FullscreenButton/
│   ├── Header/        # Barra de navegación
│   ├── History/       # Historial de animales sorteados / pendientes
│   ├── PDFGenerator/  # Generador de cartillas en PDF
│   ├── ProgressBar/   # Barra de progreso animada
│   ├── Settings/      # Panel de configuración
│   └── Sidebar/       # Panel lateral (historial + configuración)
├── context/
│   ├── BingoContext.tsx    # Estado del juego (fase, mazo, índice...)
│   └── SettingsContext.tsx # Configuración persistida
├── data/
│   └── animals.ts     # Los 30 animales con SVG inline
├── hooks/
│   ├── useFullscreen.ts
│   └── useKeyboard.ts
├── pages/
│   ├── Home/          # Pantalla de inicio
│   ├── Game/          # Pantalla de juego
│   └── Print/         # Pantalla de generación de cartillas
├── styles/
│   ├── globals.css    # Reset y estilos base
│   └── variables.css  # Design tokens (colores, espaciado, tipografía)
├── types/
│   └── index.ts       # Todos los tipos TypeScript
├── utils/
│   ├── audio.ts       # Sonidos sintetizados (Web Audio API)
│   ├── fullscreen.ts  # API Fullscreen con soporte webkit
│   ├── pdf.ts         # Generación de PDF con pdf-lib
│   ├── shuffle.ts     # Fisher-Yates shuffle
│   └── storage.ts     # localStorage helpers
├── App.tsx
└── main.tsx
```

---

## Controles de teclado / Smart TV

| Tecla | Acción |
|-------|--------|
| `→` / `Enter` / `Espacio` | Siguiente animal |
| `←` | Animal anterior |
| `p` / `Escape` | Pausar |
| `r` | Reanudar |
| `n` | Nuevo bingo |
| `f` | Pantalla completa |

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 19 | UI principal |
| TypeScript | 5.5 | Tipado estático |
| Vite | 5.4 | Bundler y servidor de desarrollo |
| CSS Modules | — | Estilos encapsulados |
| Framer Motion | 11 | Animaciones |
| pdf-lib | 1.17 | Generación de PDF |
| react-confetti | 6.1 | Efecto confetti al terminar |

---

## Compatibilidad

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+
- Android TV (navegador Chromium)
- Samsung Tizen (navegador integrado)
- LG WebOS (navegador integrado)
- Tablets y pantallas táctiles

---

## Licencia

MIT — Libre para uso educativo y personal.
