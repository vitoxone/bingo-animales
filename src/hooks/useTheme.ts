import { useEffect } from 'react';
import type { Theme } from '../types';

/**
 * Aplica el tema al <html> y mantiene sincronizado <meta name="theme-color">
 * (la barra del navegador en móvil y el marco de algunos Smart TV).
 *
 * - 'system' → se quita data-theme y manda prefers-color-scheme.
 * - 'light' / 'dark' → data-theme fuerza el tema, ignorando al sistema.
 */
export function useTheme(theme: Theme): void {
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const syncMetaColor = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', isDark ? '#0B0B18' : '#F3F4FC');
    };

    syncMetaColor();

    // Solo hace falta escuchar al sistema cuando el usuario no eligió tema.
    if (theme !== 'system') return;
    media.addEventListener('change', syncMetaColor);
    return () => media.removeEventListener('change', syncMetaColor);
  }, [theme]);
}
