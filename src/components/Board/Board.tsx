import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Board.module.css';
import { AnimalViewer } from '../AnimalViewer/AnimalViewer';
import { Countdown } from '../Countdown/Countdown';
import { BingoControls } from '../BingoControls/BingoControls';
import { Sidebar } from '../Sidebar/Sidebar';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { Icon } from '../Icon/Icon';
import { useBingo } from '../../context/BingoContext';
import { useSettings } from '../../context/SettingsContext';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useFullscreen } from '../../hooks/useFullscreen';

export function Board() {
  const {
    state,
    currentAnimal,
    drawnAnimals,
    pendingAnimals,
    progress,
    newGame,
    startOrNext,
    prevAnimal,
    pause,
    resume,
  } = useBingo();

  const { settings } = useSettings();
  const { toggle: toggleFullscreen, enter: enterFullscreen } = useFullscreen();

  /** Solo relevante bajo 900px: ahí el panel lateral es un cajón. */
  const [panelOpen, setPanelOpen] = React.useState(false);

  // Auto-fullscreen on game start
  React.useEffect(() => {
    if (state.phase === 'countdown' && settings.autoFullscreen) {
      enterFullscreen();
    }
  }, [state.phase, settings.autoFullscreen, enterFullscreen]);

  // Keyboard shortcuts
  useKeyboard({
    onNext: startOrNext,
    onPrev: prevAnimal,
    onPause: pause,
    onResume: resume,
    onNewGame: newGame,
    onFullscreen: toggleFullscreen,
    enabled: state.phase !== 'finished',
  });

  const isIdle = state.phase === 'idle';
  const isPaused = state.phase === 'paused';
  const isCountdown = state.phase === 'countdown';
  const total = state.deck.length;

  return (
    <div className={styles.board}>
      {/* Countdown overlay */}
      <AnimatePresence>
        {isCountdown && state.countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Countdown value={state.countdown} total={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            className={styles.pausedOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Juego pausado"
          >
            <motion.div
              className={styles.pausedBadge}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              aria-hidden="true"
            >
              <Icon name="pause" size={40} />
            </motion.div>

            <div className={styles.pausedTitle}>Pausado</div>
            {currentAnimal && (
              <div className={styles.pausedSubtitle}>
                En pantalla: <strong>{currentAnimal.nombre}</strong>
              </div>
            )}
            <button className={styles.pausedBtn} onClick={resume} autoFocus>
              <Icon name="play" size={20} />
              Reanudar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className={styles.main}>
        <div className={styles.stage}>
          {/* Progreso (visible durante toda la partida) */}
          {!isIdle && (
            <div className={styles.statusBar}>
              <div className={styles.statusProgress}>
                <ProgressBar
                  value={progress}
                  total={total}
                  drawn={drawnAnimals.length}
                  size="sm"
                />
              </div>

              <button
                className={styles.panelBtn}
                onClick={() => setPanelOpen(true)}
                aria-label="Abrir historial y configuración"
              >
                <Icon name="list" size={18} />
                <span className={styles.panelBtnCount}>{drawnAnimals.length}</span>
              </button>
            </div>
          )}

          {/* Escenario */}
          <div className={styles.center}>
            {isIdle ? (
              <motion.div
                className={styles.idleScreen}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.idleIcon} aria-hidden="true">
                  🎯
                </div>
                <h1 className={styles.idleTitle}>¡Todo listo para jugar!</h1>
                <p className={styles.idleSubtitle}>
                  {total} animales en orden aleatorio. Reparte las cartillas y pulsa Comenzar.
                </p>

                <div className={styles.idleMeta}>
                  <span className={styles.chip}>
                    <Icon name="sparkle" size={16} />
                    {total} animales
                  </span>
                  <span className={styles.chip}>
                    <Icon name="clock" size={16} />
                    {settings.mode === 'auto'
                      ? `Automático · ${settings.showingSeconds}s`
                      : 'Manual'}
                  </span>
                </div>

                <button className={styles.startBtn} onClick={startOrNext} autoFocus>
                  <Icon name="play" size={22} />
                  Comenzar Bingo
                </button>
              </motion.div>
            ) : currentAnimal ? (
              <AnimalViewer
                animal={currentAnimal}
                showName={settings.showName}
                currentIndex={state.currentIndex}
                total={total}
              />
            ) : null}
          </div>

          {/* Controles */}
          <BingoControls
            phase={state.phase}
            onStart={startOrNext}
            onNext={startOrNext}
            onPrev={prevAnimal}
            onPause={pause}
            onResume={resume}
            onNewGame={newGame}
            canGoPrev={state.currentIndex > 0}
            mode={settings.mode}
          />
        </div>

        {/* Panel lateral / cajón */}
        <Sidebar
          drawnAnimals={drawnAnimals}
          pendingAnimals={pendingAnimals}
          progress={progress}
          total={total}
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
        />
      </div>
    </div>
  );
}
