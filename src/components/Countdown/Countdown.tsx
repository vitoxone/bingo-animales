import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Countdown.module.css';

interface CountdownProps {
  /** Segundo actual: 3 → 2 → 1 */
  value: number;
  /** Valor inicial, para dibujar el anillo completo */
  total?: number;
}

export function Countdown({ value, total = 3 }: CountdownProps) {
  return (
    <div
      className={styles.overlay}
      role="status"
      aria-live="assertive"
      aria-label={`Cuenta regresiva: ${value}`}
    >
      <span className={styles.pulse} aria-hidden="true" />
      <span className={styles.pulse} aria-hidden="true" />

      <span className={styles.label}>¡Preparados!</span>

      <div className={styles.ringWrapper}>
        {/* Anillo que se vacía en un segundo, un tic por número */}
        <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
          <circle className={styles.ringTrack} cx="50" cy="50" r="45" />
          <motion.circle
            key={value}
            className={styles.ringFill}
            cx="50"
            cy="50"
            r="45"
            initial={{ pathLength: 1 }}
            animate={{ pathLength: 0 }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>

        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            className={styles.number}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            {value}
          </motion.div>
        </AnimatePresence>
      </div>

      <span className="sr-only">
        {value} de {total}
      </span>
    </div>
  );
}
