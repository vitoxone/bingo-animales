import React, { useState, Suspense } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import './styles/globals.css';
import styles from './App.module.css';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header/Header';
import { Home } from './pages/Home/Home';
import { Game } from './pages/Game/Game';
import { Print } from './pages/Print/Print';
import type { Page } from './types';

// ── Loading fallback ──────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <div className={styles.loaderDots} aria-hidden="true">
        <span className={styles.loaderDot} />
        <span className={styles.loaderDot} />
        <span className={styles.loaderDot} />
      </div>
      <span className={styles.loaderText}>Cargando</span>
    </div>
  );
}

// ── Page transition wrapper ───────────────────────────────────────────────────
interface TransitionProps {
  pageKey: Page;
  children: React.ReactNode;
}

function PageTransition({ pageKey, children }: TransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        className={styles.pageWrap}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Shell (dentro de SettingsProvider, para poder leer el tema) ────────────────
function AppShell() {
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useTheme(settings.theme);

  function navigate(page: Page) {
    setCurrentPage(page);
  }

  return (
    <div className={styles.shell}>
      <Header currentPage={currentPage} onNavigate={navigate} />

      <Suspense fallback={<PageLoader />}>
        <PageTransition pageKey={currentPage}>
          {currentPage === 'home' && <Home onNavigate={navigate} />}
          {currentPage === 'game' && <Game />}
          {currentPage === 'print' && <Print />}
        </PageTransition>
      </Suspense>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    /* reducedMotion="user" hace que Framer Motion respete
       prefers-reduced-motion, que hasta ahora solo cubría el CSS. */
    <MotionConfig reducedMotion="user">
      <SettingsProvider>
        <AppShell />
      </SettingsProvider>
    </MotionConfig>
  );
}
