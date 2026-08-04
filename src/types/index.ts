// ============================================================
// Core Types – Bingo de Animales
// ============================================================

/** One of the 30 animals in the game */
export interface Animal {
  id: number;
  nombre: string;
  /** Primary accent color for UI */
  color: string;
  /** Secondary / darker shade */
  colorDark: string;
  /** Inline SVG markup string */
  svg: string;
  /** Path to audio file (future) */
  audio?: string;
}

// ── Game state ───────────────────────────────────────────────

export type GamePhase =
  | 'idle'        // Not started
  | 'countdown'   // Showing 3-2-1
  | 'showing'     // Displaying current animal
  | 'paused'      // User paused
  | 'finished';   // All 30 animals shown

export interface GameState {
  phase: GamePhase;
  /** Full shuffled deck (30 animals) */
  deck: Animal[];
  /** Index into deck of the currently shown animal */
  currentIndex: number;
  /** Countdown tick: 3 → 2 → 1 */
  countdown: number;
}

// ── Settings ─────────────────────────────────────────────────

export type CountdownSeconds = 2 | 3 | 4 | 5;
export type ShowingSeconds = 3 | 5 | 8 | 10;
export type GameMode = 'manual' | 'auto';
/** 'system' sigue a prefers-color-scheme */
export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  countdownSeconds: CountdownSeconds;
  showingSeconds: ShowingSeconds;
  mode: GameMode;
  showName: boolean;
  soundEnabled: boolean;
  autoFullscreen: boolean;
  theme: Theme;
}

// ── PDF / Cartilla ───────────────────────────────────────────

/** A single bingo card (3×3 = 9 animals) */
export interface Cartilla {
  /** Unique code like BA-0001 */
  code: string;
  animals: [
    Animal, Animal, Animal,
    Animal, Animal, Animal,
    Animal, Animal, Animal,
  ];
}

// ── Navigation pages ─────────────────────────────────────────

export type Page = 'home' | 'game' | 'print';
