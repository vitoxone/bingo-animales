import { useState, useEffect, useCallback } from 'react';
import { enterFullscreen, exitFullscreen, isFullscreen } from '../utils/fullscreen';

export function useFullscreen() {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setFullscreen(isFullscreen());
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (isFullscreen()) {
        await exitFullscreen();
      } else {
        await enterFullscreen();
      }
    } catch {
      // Some environments (iframe, certain TVs) block fullscreen
    }
  }, []);

  const enter = useCallback(async () => {
    try {
      if (!isFullscreen()) await enterFullscreen();
    } catch {
      // Ignore
    }
  }, []);

  return { fullscreen, toggle, enter };
}
