import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Animal, GameState } from '../types';
import { ANIMALS } from '../data/animals';
import { shuffle } from '../utils/shuffle';
import { playCountdownTick, playReveal, playFanfare, resumeAudio } from '../utils/audio';
import { useSettings } from './SettingsContext';

// ── State & Actions ───────────────────────────────────────────────────────────

type Action =
  | { type: 'NEW_GAME' }
  | { type: 'START_COUNTDOWN' }
  | { type: 'TICK_COUNTDOWN' }
  | { type: 'SHOW_ANIMAL' }
  | { type: 'NEXT_ANIMAL' }
  | { type: 'PREV_ANIMAL' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'FINISH' };

function makeInitialState(): GameState {
  return {
    phase: 'idle',
    deck: shuffle(ANIMALS),
    currentIndex: -1,
    countdown: 3,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return { ...makeInitialState() };

    case 'START_COUNTDOWN':
      return { ...state, phase: 'countdown', countdown: 3 };

    case 'TICK_COUNTDOWN': {
      const next = state.countdown - 1;
      if (next <= 0) return { ...state, phase: 'countdown', countdown: 0 };
      return { ...state, countdown: next };
    }

    case 'SHOW_ANIMAL': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.deck.length) {
        return { ...state, phase: 'finished' };
      }
      return { ...state, phase: 'showing', currentIndex: nextIndex, countdown: 3 };
    }

    case 'NEXT_ANIMAL': {
      const nextIdx = state.currentIndex + 1;
      if (nextIdx >= state.deck.length) {
        return { ...state, phase: 'finished' };
      }
      return { ...state, phase: 'countdown', currentIndex: state.currentIndex, countdown: 3 };
    }

    case 'PREV_ANIMAL': {
      const prevIdx = Math.max(0, state.currentIndex - 1);
      return { ...state, phase: 'showing', currentIndex: prevIdx };
    }

    case 'PAUSE':
      return { ...state, phase: 'paused' };

    case 'RESUME':
      return { ...state, phase: 'showing' };

    case 'FINISH':
      return { ...state, phase: 'finished' };

    default:
      return state;
  }
}

// ── Context shape ─────────────────────────────────────────────────────────────

interface BingoContextValue {
  /** Full game state */
  state: GameState;
  /** Currently displayed animal (null if game hasn't started or is idle) */
  currentAnimal: Animal | null;
  /** Animals already shown (sorted oldest→newest) */
  drawnAnimals: Animal[];
  /** Animals not yet shown */
  pendingAnimals: Animal[];
  /** Progress 0–1 */
  progress: number;

  // Actions
  newGame: () => void;
  startOrNext: () => void;
  prevAnimal: () => void;
  pause: () => void;
  resume: () => void;
}

const BingoContext = createContext<BingoContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function BingoProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Evitan repetir un sonido cuando el efecto se re-ejecuta sin que el juego avance */
  const lastTickRef = useRef<number | null>(null);
  const lastRevealRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    autoTimerRef.current = null;
    countdownTimerRef.current = null;
  }, []);

  // ── Countdown logic ─────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'countdown') return;
    clearTimers();

    countdownTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_COUNTDOWN' });
    }, 1000);

    return () => clearTimers();
  }, [state.phase, state.currentIndex, clearTimers]);

  // Un tic sonoro por número (3 · 2 · 1), cada vez más agudo
  useEffect(() => {
    if (state.phase !== 'countdown' || state.countdown <= 0) {
      lastTickRef.current = null;
      return;
    }
    if (lastTickRef.current === state.countdown) return;

    lastTickRef.current = state.countdown;
    playCountdownTick(state.countdown, settings.soundEnabled);
  }, [state.phase, state.countdown, settings.soundEnabled]);

  // When countdown hits 0, show the animal
  useEffect(() => {
    if (state.phase === 'countdown' && state.countdown === 0) {
      clearTimers();
      dispatch({ type: 'SHOW_ANIMAL' });
    }
  }, [state.phase, state.countdown, clearTimers]);

  // ── Auto-advance logic ───────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'showing' || settings.mode !== 'auto') return;

    clearTimers();
    autoTimerRef.current = setTimeout(() => {
      dispatch({ type: 'NEXT_ANIMAL' });
    }, settings.showingSeconds * 1000);

    return () => clearTimers();
  }, [
    state.phase,
    state.currentIndex,
    settings.mode,
    settings.showingSeconds,
    settings.soundEnabled,
    clearTimers,
  ]);

  // Sonido de aparición del animal (una sola vez por animal, en ambos modos:
  // reanudar tras una pausa no vuelve a dispararlo)
  useEffect(() => {
    if (state.phase !== 'showing') return;
    if (lastRevealRef.current === state.currentIndex) return;

    lastRevealRef.current = state.currentIndex;
    playReveal(settings.soundEnabled);
  }, [state.phase, state.currentIndex, settings.soundEnabled]);

  // Fanfare on finish
  useEffect(() => {
    if (state.phase === 'finished') {
      clearTimers();
      playFanfare(settings.soundEnabled);
    }
  }, [state.phase, settings.soundEnabled, clearTimers]);

  // Cleanup on unmount
  useEffect(() => clearTimers, [clearTimers]);

  // ── Derived data ─────────────────────────────────────────
  const currentAnimal =
    state.currentIndex >= 0 && state.currentIndex < state.deck.length
      ? state.deck[state.currentIndex]
      : null;

  const drawnAnimals = state.currentIndex >= 0 ? state.deck.slice(0, state.currentIndex + 1) : [];

  const pendingAnimals =
    state.currentIndex >= 0 ? state.deck.slice(state.currentIndex + 1) : state.deck;

  const progress = state.deck.length > 0 ? drawnAnimals.length / state.deck.length : 0;

  // ── Public actions ───────────────────────────────────────
  const newGame = useCallback(() => {
    clearTimers();
    lastRevealRef.current = null;
    lastTickRef.current = null;
    dispatch({ type: 'NEW_GAME' });
  }, [clearTimers]);

  const startOrNext = useCallback(() => {
    // El navegador deja el AudioContext suspendido hasta que hay un gesto
    // del usuario: este es el primero de la partida.
    void resumeAudio();

    if (state.phase === 'idle') {
      dispatch({ type: 'START_COUNTDOWN' });
    } else if (state.phase === 'showing' || state.phase === 'paused') {
      dispatch({ type: 'NEXT_ANIMAL' });
    }
  }, [state.phase]);

  const prevAnimal = useCallback(() => {
    if (state.currentIndex > 0) {
      clearTimers();
      dispatch({ type: 'PREV_ANIMAL' });
    }
  }, [state.currentIndex, clearTimers]);

  const pause = useCallback(() => {
    clearTimers();
    dispatch({ type: 'PAUSE' });
  }, [clearTimers]);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME' });
  }, []);

  return (
    <BingoContext.Provider
      value={{
        state,
        currentAnimal,
        drawnAnimals,
        pendingAnimals,
        progress,
        newGame,
        startOrNext,
        prevAnimal,
        pause,
        resume,
      }}
    >
      {children}
    </BingoContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBingo(): BingoContextValue {
  const ctx = useContext(BingoContext);
  if (!ctx) throw new Error('useBingo must be used inside <BingoProvider>');
  return ctx;
}
