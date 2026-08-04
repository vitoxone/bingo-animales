import React, { memo, useMemo } from 'react';
import styles from './LotteryAnimation.module.css';

interface ParticleEffectsProps {
  /** 'orbit' acompaña al bombo girando; 'burst' es el confeti del ganador */
  variant: 'orbit' | 'burst';
  count?: number;
  /** Color de acento del animal ganador (solo en 'burst') */
  color?: string;
}

const BURST_COLORS = ['#6C63FF', '#FF6B6B', '#FFE066', '#34C88E', '#38BDF8'];

/**
 * Partículas decorativas.
 *
 * Son elementos estáticos animados por CSS con `transform` y `opacity`: el
 * navegador las compone en GPU y React no vuelve a renderizar nada mientras
 * duran. Nada de animar por fotograma desde JS.
 */
function ParticleEffectsComponent({ variant, count = 14, color }: ParticleEffectsProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (360 / count) * i + (variant === 'burst' ? Math.random() * 24 : 0);
        return {
          id: i,
          angle,
          delay: variant === 'orbit' ? (i / count) * 2.4 : Math.random() * 0.18,
          distance: variant === 'orbit' ? 46 + (i % 3) * 6 : 38 + Math.random() * 48,
          size: variant === 'orbit' ? 5 + (i % 3) * 2 : 7 + Math.random() * 7,
          color:
            variant === 'burst'
              ? i % 4 === 0 && color
                ? color
                : BURST_COLORS[i % BURST_COLORS.length]
              : undefined,
        };
      }),
    [count, variant, color]
  );

  return (
    <div className={variant === 'orbit' ? styles.orbitLayer : styles.burstLayer} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={variant === 'orbit' ? styles.orbitParticle : styles.burstParticle}
          style={
            {
              '--angle': `${p.angle}deg`,
              '--delay': `${p.delay}s`,
              '--distance': `${p.distance}%`,
              '--size': `${p.size}px`,
              ...(p.color ? { '--particle-color': p.color } : null),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export const ParticleEffects = memo(ParticleEffectsComponent);
