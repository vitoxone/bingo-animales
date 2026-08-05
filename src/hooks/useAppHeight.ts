import { useEffect } from 'react';

/**
 * Publica el alto REAL de la ventana en `--app-height`.
 *
 * En Safari de iPhone, `100vh` cuenta el área que tapan las barras del
 * navegador y `100svh` tampoco coincide cuando la barra inferior está en modo
 * compacto: el resultado era que la botonera quedaba fuera de la pantalla.
 * `window.innerHeight` (y `visualViewport`, cuando existe) sí describe lo que
 * el usuario ve, y funciona igual en navegadores de Smart TV sin unidades svh.
 *
 * Ojo: la primera medición puede caer mientras Safari todavía tiene las barras
 * plegadas y devolver un alto MAYOR que el visible, sin emitir después ningún
 * `resize`. Por eso se remide tras el pintado inicial y en `pageshow`/`load`,
 * y el CSS acota el resultado con `min(100svh, var(--app-height))`.
 */
export function useAppHeight(): void {
  useEffect(() => {
    let raf = 0;
    const timers: number[] = [];

    const apply = () => {
      const viewport = window.visualViewport?.height ?? window.innerHeight;
      // El menor de los dos: con el teclado abierto manda visualViewport, y
      // ante una lectura inflada de este, innerHeight hace de tope.
      const height = Math.min(viewport, window.innerHeight || viewport);
      document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    apply();
    // Las barras de Safari terminan de asentarse después del primer pintado
    timers.push(window.setTimeout(apply, 120), window.setTimeout(apply, 500));

    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.addEventListener('pageshow', schedule);
    window.addEventListener('load', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('scroll', schedule);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.removeEventListener('pageshow', schedule);
      window.removeEventListener('load', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('scroll', schedule);
    };
  }, []);
}
