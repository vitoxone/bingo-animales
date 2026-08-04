import React from 'react';
import styles from './AnimalCard.module.css';
import type { Animal } from '../../types';

interface AnimalCardProps {
  animal: Animal;
  drawn?: boolean;
  showName?: boolean;
  order?: number;
}

export function AnimalCard({ animal, drawn = false, showName = true, order }: AnimalCardProps) {
  const label = drawn ? `${animal.nombre} · sorteado #${order}` : `${animal.nombre} · pendiente`;

  return (
    <div className={styles.cardOuter}>
      <div
        className={`${styles.card} ${drawn ? styles.drawn : ''}`}
        style={{ borderColor: drawn ? undefined : animal.color }}
        title={label}
        aria-label={label}
      >
        <div
          className={styles.svgWrapper}
          style={{ backgroundColor: `${animal.color}1F` }}
          dangerouslySetInnerHTML={{ __html: animal.svg }}
        />
        {showName && <span className={styles.name}>{animal.nombre}</span>}
      </div>

      {drawn && order !== undefined && (
        <div className={styles.drawnBadge} aria-hidden="true">
          {order}
        </div>
      )}
    </div>
  );
}
