import { useEffect, useState } from 'react';

/**
 * Sigue una media query desde JS.
 *
 * Hace falta cuando el cambio no es solo de estilo: bajo 900px el panel lateral
 * no se "re-estiliza", se monta en otro sitio del DOM (un portal).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let media: MediaQueryList;
    try {
      media = window.matchMedia(query);
    } catch {
      return;
    }

    const onChange = () => setMatches(media.matches);
    onChange();

    // addListener: navegadores de Smart TV antiguos no traen addEventListener
    if (media.addEventListener) {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, [query]);

  return matches;
}
