import { useEffect } from 'react';

interface KeyboardOptions {
  onNext?: () => void;
  onPrev?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onNewGame?: () => void;
  onFullscreen?: () => void;
  enabled?: boolean;
}

/**
 * Global keyboard (and remote-control) handler for game navigation.
 *
 * Keys:
 *  ArrowRight / Enter / Space  → Next / Start
 *  ArrowLeft                   → Previous
 *  p / P                       → Pause / Resume
 *  n / N                       → New game
 *  f / F                       → Fullscreen
 *  Escape                      → Pause
 */
export function useKeyboard({
  onNext,
  onPrev,
  onPause,
  onResume,
  onNewGame,
  onFullscreen,
  enabled = true,
}: KeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Don't steal events from input/textarea/select elements
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          e.preventDefault();
          onNext?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev?.();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          onPause?.();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          onResume?.();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          onNewGame?.();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          onFullscreen?.();
          break;
        case 'Escape':
          e.preventDefault();
          onPause?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onNext, onPrev, onPause, onResume, onNewGame, onFullscreen]);
}
