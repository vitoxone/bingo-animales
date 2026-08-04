import React from 'react';
import styles from './FullscreenButton.module.css';
import { Icon } from '../Icon/Icon';
import { useFullscreen } from '../../hooks/useFullscreen';

export function FullscreenButton() {
  const { fullscreen, toggle, supported } = useFullscreen();

  // Safari en iPhone no expone la Fullscreen API: mejor no mostrar un botón
  // que no puede hacer nada.
  if (!supported) return null;

  return (
    <button
      className={`${styles.btn} ${fullscreen ? styles.active : ''}`}
      onClick={toggle}
      title={fullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'}
      aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
      aria-pressed={fullscreen}
    >
      <Icon name={fullscreen ? 'collapse' : 'expand'} size={20} />
    </button>
  );
}
