import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import styles from './Game.module.css';
import { Board } from '../../components/Board/Board';
import { Icon } from '../../components/Icon/Icon';
import { BingoProvider, useBingo } from '../../context/BingoContext';
import { useKeyboard } from '../../hooks/useKeyboard';

// Inner component that has access to BingoContext
function GameInner() {
  const { state, drawnAnimals, newGame } = useBingo();
  const isFinished = state.phase === 'finished';

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handler = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Keyboard: Enter/Space on finished screen → new game
  useKeyboard({
    onNext: isFinished ? newGame : undefined,
    onNewGame: newGame,
    enabled: isFinished,
  });

  return (
    <div className={styles.page}>
      {/* Confetti on finish */}
      <AnimatePresence>
        {isFinished && (
          <>
            <div className={styles.confettiContainer}>
              <ReactConfetti
                width={windowSize.width}
                height={windowSize.height}
                numberOfPieces={350}
                recycle={false}
                gravity={0.2}
                initialVelocityY={25}
                colors={['#6C63FF', '#FF6B6B', '#FFE066', '#17A673', '#2E86E0', '#F0A020']}
              />
            </div>

            <motion.div
              className={styles.finishedOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              role="dialog"
              aria-modal="true"
              aria-label="Bingo terminado"
            >
              <motion.div
                className={styles.finishedContent}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              >
                <motion.div
                  initial={{ scale: 0.4, rotate: -14 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.15 }}
                  style={{ fontSize: 'clamp(56px, 12vh, 88px)', lineHeight: 1 }}
                  aria-hidden="true"
                >
                  🎉
                </motion.div>

                <h1 className={styles.finishedTitle}>¡Bingo Terminado!</h1>

                <p className={styles.finishedSubtitle}>
                  ¡Felicidades! Ya salieron todos los animales.
                </p>

                <div className={styles.finishedStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{drawnAnimals.length}</span>
                    <span className={styles.statLabel}>Sorteados</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>100%</span>
                    <span className={styles.statLabel}>Completado</span>
                  </div>
                </div>

                <button
                  className={styles.finishedBtn}
                  onClick={newGame}
                  autoFocus
                  aria-label="Comenzar nuevamente"
                >
                  <Icon name="refresh" size={22} />
                  Jugar de nuevo
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Game board */}
      <Board />
    </div>
  );
}

/** Game page — wraps GameInner in BingoProvider */
export function Game() {
  return (
    <BingoProvider>
      <GameInner />
    </BingoProvider>
  );
}
