import React from 'react';
import styles from './BingoControls.module.css';
import { Icon, type IconName } from '../Icon/Icon';
import { useFullscreen } from '../../hooks/useFullscreen';
import type { GamePhase } from '../../types';

interface BingoControlsProps {
  phase: GamePhase;
  onStart: () => void;
  onNext: () => void;
  onPrev: () => void;
  onPause: () => void;
  onResume: () => void;
  onNewGame: () => void;
  canGoPrev: boolean;
  mode: 'manual' | 'auto';
}

// ── Botón secundario: icono en círculo + etiqueta ─────────────────────────────
interface ActionProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  variant?: 'default' | 'warning' | 'danger';
}

function Action({ icon, label, onClick, title, disabled, variant = 'default' }: ActionProps) {
  const variantClass = variant === 'default' ? '' : styles[variant];
  return (
    <button
      className={`${styles.action} ${variantClass}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      <span className={styles.actionIcon}>
        <Icon name={icon} size={22} />
      </span>
      <span className={styles.actionLabel}>{label}</span>
    </button>
  );
}

export function BingoControls({
  phase,
  onStart,
  onNext,
  onPrev,
  onPause,
  onResume,
  onNewGame,
  canGoPrev,
  mode,
}: BingoControlsProps) {
  const { fullscreen, toggle } = useFullscreen();

  const isIdle = phase === 'idle';
  const isShowing = phase === 'showing';
  const isPaused = phase === 'paused';
  const isCountdown = phase === 'countdown';

  /** Un único botón primario que cambia de significado según la fase. */
  const primary: { icon: IconName; label: string; onClick?: () => void; title: string } = isIdle
    ? { icon: 'play', label: 'Comenzar', onClick: onStart, title: 'Comenzar bingo (Enter)' }
    : isPaused
      ? { icon: 'play', label: 'Reanudar', onClick: onResume, title: 'Reanudar (r)' }
      : isCountdown
        ? { icon: 'clock', label: 'Preparando…', title: 'Preparando el siguiente animal' }
        : isShowing && mode === 'manual'
          ? { icon: 'next', label: 'Siguiente', onClick: onNext, title: 'Siguiente animal (→ / Enter)' }
          : { icon: 'pause', label: 'Automático', title: 'Avance automático en curso' };

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {/* Anterior */}
        <Action
          icon="prev"
          label="Anterior"
          onClick={onPrev}
          disabled={!canGoPrev || isCountdown || isIdle}
          title="Animal anterior (←)"
        />

        {/* Acción principal */}
        <button
          className={styles.primary}
          onClick={primary.onClick}
          disabled={!primary.onClick}
          title={primary.title}
          aria-label={primary.title}
          autoFocus={isIdle || (isShowing && mode === 'manual')}
        >
          <Icon name={primary.icon} size={24} />
          {primary.label}
        </button>

        {/* Pausar (solo mientras hay un animal en pantalla) */}
        {isShowing && (
          <Action
            icon="pause"
            label="Pausar"
            onClick={onPause}
            title="Pausar (p / Escape)"
            variant="warning"
          />
        )}

        {/* Saltar: en modo automático adelanta sin esperar */}
        {isShowing && mode === 'auto' && (
          <Action icon="skip" label="Saltar" onClick={onNext} title="Siguiente ahora (→)" />
        )}

        {/* Nuevo bingo */}
        {!isIdle && (
          <Action
            icon="refresh"
            label="Nuevo"
            onClick={onNewGame}
            title="Nuevo bingo (n)"
            variant="danger"
          />
        )}

        {/* Pantalla completa */}
        <Action
          icon={fullscreen ? 'collapse' : 'expand'}
          label={fullscreen ? 'Ventana' : 'Completa'}
          onClick={toggle}
          title={fullscreen ? 'Salir de pantalla completa (f)' : 'Pantalla completa (f)'}
        />
      </div>

      {/* Atajos de teclado / control remoto */}
      <div className={styles.hints} aria-hidden="true">
        <span className={styles.hint}>
          <kbd>→</kbd>
          <kbd>Enter</kbd> Siguiente
        </span>
        <span className={styles.hint}>
          <kbd>←</kbd> Anterior
        </span>
        <span className={styles.hint}>
          <kbd>P</kbd> Pausar
        </span>
        <span className={styles.hint}>
          <kbd>N</kbd> Nuevo
        </span>
        <span className={styles.hint}>
          <kbd>F</kbd> Pantalla completa
        </span>
      </div>
    </div>
  );
}
