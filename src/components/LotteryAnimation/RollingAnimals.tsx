import React, { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './LotteryAnimation.module.css';
import type { Animal } from '../../types';

interface RollingAnimalsProps {
  /** Animales a mostrar, uno por tic. El último es el ganador. */
  sequence: Animal[];
  /** Momento de cada cambio, en ms desde que arranca la animación */
  schedule: number[];
  /** Índice a partir del cual los cambios son lentos y conviene animarlos */
  slowFrom: number;
  onSettled: () => void;
}

/**
 * Va cambiando el animal dentro del bombo siguiendo `schedule`.
 *
 * Usa un único requestAnimationFrame con reloj propio en lugar de una cadena
 * de setTimeout: no acumula desfase, se detiene solo si la pestaña pasa a
 * segundo plano y hace un `setState` por tic, no por fotograma.
 */
function RollingAnimalsComponent({ sequence, schedule, slowFrom, onSettled }: RollingAnimalsProps) {
  const [index, setIndex] = useState(0);
  const settledRef = useRef(false);
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  useEffect(() => {
    settledRef.current = false;
    setIndex(0);

    let frame = 0;
    const start = performance.now();
    let next = 1;

    const step = (now: number) => {
      const elapsed = now - start;

      // Puede haberse saltado varios tics si hubo un tirón: se avanza al que toca
      let advanced = false;
      while (next < schedule.length && elapsed >= schedule[next]) {
        next++;
        advanced = true;
      }
      if (advanced) setIndex(next - 1);

      if (next < schedule.length) {
        frame = requestAnimationFrame(step);
      } else if (!settledRef.current) {
        settledRef.current = true;
        setIndex(sequence.length - 1);
        onSettledRef.current();
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [schedule, sequence.length]);

  const animal = sequence[Math.min(index, sequence.length - 1)];
  // En la parte rápida los cambios son demasiado seguidos para animarlos:
  // animar ahí solo gastaría fotogramas sin que se aprecie.
  const animated = index >= slowFrom;

  return (
    <motion.div
      key={index}
      className={styles.rollingItem}
      initial={animated ? { scale: 0.72, opacity: 0.4, y: 10 } : false}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={
        animated
          ? { type: 'spring', stiffness: 420, damping: 22 }
          : { duration: 0 }
      }
    >
      <div
        className={styles.rollingSvg}
        dangerouslySetInnerHTML={{ __html: animal.svg }}
        aria-hidden="true"
      />
    </motion.div>
  );
}

export const RollingAnimals = memo(RollingAnimalsComponent);
