import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './History.module.css';
import { AnimalCard } from '../AnimalCard/AnimalCard';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { Icon } from '../Icon/Icon';
import type { Animal } from '../../types';

interface HistoryProps {
  drawnAnimals: Animal[];
  pendingAnimals: Animal[];
  progress: number;
  total: number;
}

export function History({ drawnAnimals, pendingAnimals, progress, total }: HistoryProps) {
  // Los pendientes van ocultos: verlos adelanta lo que va a salir.
  // Quien dirige el juego puede revelarlos si los necesita.
  const [showPending, setShowPending] = useState(false);
  const latest = drawnAnimals[drawnAnimals.length - 1];
  // Más reciente primero
  const drawnDesc = [...drawnAnimals].reverse();

  return (
    <div className={styles.panel}>
      {/* Resumen */}
      <div className={styles.summary}>
        <div className={styles.summaryTop}>
          <span className={styles.summaryValue}>
            {drawnAnimals.length}
            <small> / {total}</small>
          </span>
          <span className={styles.summaryLabel}>Sorteados</span>
        </div>
        <ProgressBar value={progress} total={total} drawn={drawnAnimals.length} size="md" showLabels={false} />
      </div>

      {/* Último sorteado */}
      {latest && (
        <motion.div
          key={latest.id}
          className={styles.latest}
          style={{ '--animal-color': latest.color } as React.CSSProperties}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className={styles.latestThumb}
            style={{ backgroundColor: `${latest.color}22` }}
            dangerouslySetInnerHTML={{ __html: latest.svg }}
          />
          <div className={styles.latestText}>
            <span className={styles.latestLabel}>Último</span>
            <span className={styles.latestName}>{latest.nombre}</span>
          </div>
        </motion.div>
      )}

      {/* Sorteados */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Ya salieron</span>
          <span className={styles.badge}>{drawnAnimals.length}</span>
        </div>
        {drawnAnimals.length === 0 ? (
          <p className={styles.emptyMsg}>Todavía no salió ningún animal</p>
        ) : (
          <div className={styles.grid}>
            {drawnDesc.map((animal, i) => (
              <motion.div
                key={animal.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
              >
                <AnimalCard
                  animal={animal}
                  drawn
                  showName={false}
                  order={drawnAnimals.length - i}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Pendientes */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Faltan</span>
          <span className={styles.headerActions}>
            {pendingAnimals.length > 0 && (
              <button
                className={styles.revealBtn}
                onClick={() => setShowPending((v) => !v)}
                aria-expanded={showPending}
              >
                {showPending ? 'Ocultar' : 'Ver'}
              </button>
            )}
            <span className={`${styles.badge} ${styles.pending}`}>{pendingAnimals.length}</span>
          </span>
        </div>

        {pendingAnimals.length === 0 ? (
          <p className={styles.emptyMsg}>¡Salieron todos los animales! 🎉</p>
        ) : showPending ? (
          <div className={styles.grid}>
            {pendingAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} showName={false} />
            ))}
          </div>
        ) : (
          <p className={styles.hiddenMsg}>
            <Icon name="sparkle" size={16} />
            {pendingAnimals.length === 1
              ? 'Queda 1 animal por salir'
              : `Quedan ${pendingAnimals.length} animales por salir`}
          </p>
        )}
      </section>
    </div>
  );
}
