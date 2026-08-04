import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AnimalViewer.module.css';
import type { Animal } from '../../types';

interface AnimalViewerProps {
  animal: Animal;
  showName: boolean;
  currentIndex: number;
  total: number;
}

export function AnimalViewer({ animal, showName, currentIndex, total }: AnimalViewerProps) {
  return (
    <div
      className={styles.wrapper}
      style={{ '--animal-color': animal.color } as React.CSSProperties}
    >
      {/* Anuncia el animal a lectores de pantalla sin duplicar el texto visible */}
      <span className="sr-only" role="status" aria-live="polite">
        Animal {currentIndex + 1} de {total}: {animal.nombre}
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={animal.id}
          className={styles.card}
          style={
            {
              borderColor: animal.color,
              '--animal-color': animal.color,
            } as React.CSSProperties
          }
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.08, y: -30 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        >
          {/* Posición en el mazo */}
          <div className={styles.badge} aria-hidden="true">
            #{currentIndex + 1}
            <span className={styles.badgeCount}>de {total}</span>
          </div>

          {/* Ilustración */}
          <motion.div
            className={styles.svgWrapper}
            initial={{ rotate: -4, scale: 0.94 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            dangerouslySetInnerHTML={{ __html: animal.svg }}
          />

          {/* Nombre */}
          {showName && (
            <motion.div
              className={styles.nameWrapper}
              style={{ borderColor: animal.color }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.28 }}
            >
              <span className={styles.name}>{animal.nombre}</span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
