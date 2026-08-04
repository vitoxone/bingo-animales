import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import styles from './LotteryAnimation.module.css';
import { LotterySphere } from './LotterySphere';
import { RollingAnimals } from './RollingAnimals';
import { ParticleEffects } from './ParticleEffects';
import { playSpinTicks, playWinChime } from '../../utils/audio';
import { shuffle } from '../../utils/shuffle';
import type { Animal } from '../../types';

// ── Tiempos (ms) ──────────────────────────────────────────────────────────────
const TIMING = {
  /** Mezcla rápida: ~12 cambios por segundo */
  fast: 1800,
  fastInterval: 82,
  /** Frenada progresiva hasta casi detenerse */
  slow: 1700,
  slowInterval: 430,
  /** El bombo se abre y el ganador sale al frente */
  reveal: 1100,
  /** El ganador se queda quieto antes del fundido */
  hold: 800,
  fade: 380,
} as const;

/** Cuántos animales distintos giran dentro del bombo */
const CANDIDATES = 10;

type Stage = 'spinning' | 'slowing' | 'reveal' | 'exit';

/**
 * Calcula el instante de cada cambio de animal.
 *
 * Primero a ritmo constante y después separándose con una curva easeOut, que
 * es lo que da la sensación de que el bombo pierde inercia. La misma lista de
 * tiempos alimenta la imagen y el sonido, así que van perfectamente a la par.
 */
function buildSchedule(): { schedule: number[]; slowFrom: number } {
  const schedule: number[] = [];

  let t = 0;
  while (t < TIMING.fast) {
    schedule.push(t);
    t += TIMING.fastInterval;
  }

  const slowFrom = schedule.length;
  const slowStart = t;
  let elapsed = 0;

  while (elapsed < TIMING.slow) {
    schedule.push(slowStart + elapsed);
    const progress = Math.min(1, elapsed / TIMING.slow);
    const eased = 1 - Math.pow(1 - progress, 3);
    elapsed += TIMING.fastInterval + (TIMING.slowInterval - TIMING.fastInterval) * eased;
  }

  return { schedule, slowFrom };
}

interface LotteryAnimationProps {
  /** Animal que va a salir premiado */
  winner: Animal;
  /** Resto del mazo, de donde salen los animales que giran */
  pool: Animal[];
  soundEnabled: boolean;
  /** Se llama cuando termina: el tablero muestra entonces la pantalla del animal */
  onComplete: () => void;
}

export function LotteryAnimation({
  winner,
  pool,
  soundEnabled,
  onComplete,
}: LotteryAnimationProps) {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>('spinning');

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Se calculan una sola vez por sorteo
  const { schedule, slowFrom } = useMemo(buildSchedule, []);

  /** Secuencia de animales, un tic cada uno; el último es siempre el ganador */
  const sequence = useMemo(() => {
    const others = shuffle(pool.filter((a) => a.id !== winner.id)).slice(0, CANDIDATES - 1);
    const candidates = shuffle([...others, winner]);
    if (candidates.length === 0) return [winner];

    const items: Animal[] = [];
    for (let i = 0; i < schedule.length; i++) {
      items.push(candidates[i % candidates.length]);
    }
    // El premio no puede depender del azar del ciclo
    items[items.length - 1] = winner;
    return items;
  }, [pool, winner, schedule.length]);

  const stageForSphere = stage === 'spinning' ? 'spinning' : stage === 'slowing' ? 'slowing' : 'reveal';

  // Clics de la ruleta, programados de una vez en el reloj del audio
  useEffect(() => {
    playSpinTicks(schedule, soundEnabled);
  }, [schedule, soundEnabled]);

  // Marca el paso a "frenando" para que el bombo se calme
  useEffect(() => {
    const id = setTimeout(() => setStage((s) => (s === 'spinning' ? 'slowing' : s)), TIMING.fast);
    return () => clearTimeout(id);
  }, []);

  /** Termina el giro: el bombo se abre y aparece el ganador */
  const handleSettled = useCallback(() => {
    setStage('reveal');
    playWinChime(soundEnabled);
  }, [soundEnabled]);

  // Del reveal al fundido, y de ahí a la pantalla de siempre
  useEffect(() => {
    if (stage !== 'reveal') return;
    const id = setTimeout(() => setStage('exit'), TIMING.reveal + TIMING.hold);
    return () => clearTimeout(id);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'exit') return;
    const id = setTimeout(() => onCompleteRef.current(), TIMING.fade);
    return () => clearTimeout(id);
  }, [stage]);

  /** Permite adelantar el sorteo sin esperar (útil al repetir muchas partidas) */
  const skip = useCallback(() => {
    if (stage === 'reveal' || stage === 'exit') return;
    setStage('reveal');
    playWinChime(soundEnabled);
  }, [stage, soundEnabled]);

  const showingWinner = stage === 'reveal' || stage === 'exit';

  return (
    <motion.div
      className={styles.overlay}
      style={{ '--winner-color': winner.color } as React.CSSProperties}
      initial={{ opacity: 0 }}
      animate={{ opacity: stage === 'exit' ? 0 : 1 }}
      transition={{ duration: stage === 'exit' ? TIMING.fade / 1000 : 0.3, ease: 'easeInOut' }}
      onClick={skip}
      role="status"
      aria-live="polite"
      aria-label={showingWinner ? `¡Salió ${winner.nombre}!` : 'Sorteando el siguiente animal'}
    >
      <div className={styles.stage}>
        {!showingWinner && (
          <>
            <span className={styles.title}>Sorteando…</span>
            {!reduceMotion && <ParticleEffects variant="orbit" count={14} />}
          </>
        )}

        <AnimatePresence mode="wait">
          {!showingWinner ? (
            <LotterySphere key="sphere" phase={stageForSphere}>
              <RollingAnimals
                sequence={sequence}
                schedule={schedule}
                slowFrom={slowFrom}
                onSettled={handleSettled}
              />
            </LotterySphere>
          ) : (
            <motion.div
              key="winner"
              className={styles.winner}
              initial={{ scale: 0.35, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 17 }}
            >
              {!reduceMotion && (
                <ParticleEffects variant="burst" count={18} color={winner.color} />
              )}

              <div className={styles.winnerGlow} aria-hidden="true" />
              <div
                className={styles.winnerSvg}
                style={{ borderColor: winner.color }}
                dangerouslySetInnerHTML={{ __html: winner.svg }}
                aria-hidden="true"
              />
              <motion.span
                className={styles.winnerName}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.3 }}
              >
                {winner.nombre}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
