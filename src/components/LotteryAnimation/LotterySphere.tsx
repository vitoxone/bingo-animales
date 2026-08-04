import React, { memo } from 'react';
import { motion } from 'framer-motion';
import styles from './LotteryAnimation.module.css';

export type SpherePhase = 'spinning' | 'slowing' | 'reveal';

interface LotterySphereProps {
  phase: SpherePhase;
  children: React.ReactNode;
}

/**
 * El bombo: una esfera de cristal translúcida.
 *
 * Toda la animación se hace con `transform` y `opacity` (nunca con width,
 * height o filtros por fotograma) para que el compositor la resuelva en GPU y
 * aguante 60 fps también en Android TV, Tizen y WebOS.
 */
function LotterySphereComponent({ phase, children }: LotterySphereProps) {
  const isReveal = phase === 'reveal';

  return (
    <motion.div
      className={styles.sphereWrap}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={
        isReveal
          ? // Al revelar, el bombo se abre: crece y se desvanece
            { scale: 1.55, opacity: 0, rotate: 0 }
          : {
              scale: 1,
              opacity: 1,
              // Vibración: más nerviosa girando, casi quieta al frenar
              x: phase === 'spinning' ? [-3, 3, -3] : [-1, 1, -1],
              y: phase === 'spinning' ? [2, -2, 2] : [1, -1, 1],
              rotate: phase === 'spinning' ? [-2.5, 2.5, -2.5] : [-1, 1, -1],
            }
      }
      transition={
        isReveal
          ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          : {
              scale: { type: 'spring', stiffness: 180, damping: 16 },
              opacity: { duration: 0.35 },
              x: { duration: phase === 'spinning' ? 0.28 : 0.7, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: phase === 'spinning' ? 0.34 : 0.8, repeat: Infinity, ease: 'easeInOut' },
              rotate: {
                duration: phase === 'spinning' ? 0.5 : 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
      }
    >
      {/* Cristal, brillo y reflejos son puro CSS: no cuestan por fotograma */}
      <div className={styles.sphereGlass} aria-hidden="true">
        <span className={`${styles.sphereShine} ${phase === 'spinning' ? styles.shineFast : ''}`} />
        <span className={styles.sphereHighlight} />
      </div>

      <div className={styles.sphereContent}>{children}</div>

      {/* Boca del bombo, como en una tómbola real */}
      <div className={styles.sphereBase} aria-hidden="true" />
    </motion.div>
  );
}

export const LotterySphere = memo(LotterySphereComponent);
