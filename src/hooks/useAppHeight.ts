import { useEffect } from 'react';

/**
 * Publica el alto REAL de la ventana en `--app-height`.
 *
 * En Safari de iPhone, `100vh` cuenta el área que tapan las barras del
 * navegador y `100svh` tampoco coincide cuando la barra inferior está en modo
 * compacto: el resultado era que la botonera quedaba fuera de la pantalla.
 * `window.innerHeight` (y `visualViewport`, cuando existe) sí describe lo que
 * el usuario ve, y funciona igual en navegadores de Smart TV sin unidades svh.
 */
export function useAppHeight(): void {
  useEffect(() => {
    const apply = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`);
    };

    apply();

    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    window.visualViewport?.addEventListener('resize', apply);

    return () => {
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', apply);
      window.visualViewport?.removeEventListener('resize', apply);
    };
  }, []);
}
