import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  /** 0 a 1 */
  value: number;
  total: number;
  drawn: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function ProgressBar({
  value,
  total,
  drawn,
  size = 'md',
  showLabels = true,
}: ProgressBarProps) {
  const pct = Math.round(value * 100);

  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      {showLabels && (
        <div className={styles.labels}>
          <span className={styles.count}>
            <strong>{drawn}</strong> de {total} animales
          </span>
          <span className={styles.percent}>{pct}%</span>
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso del bingo: ${drawn} de ${total} animales`}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
