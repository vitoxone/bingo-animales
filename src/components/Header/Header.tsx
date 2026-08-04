import React from 'react';
import { motion } from 'framer-motion';
import styles from './Header.module.css';
import { Icon, type IconName } from '../Icon/Icon';
import { FullscreenButton } from '../FullscreenButton/FullscreenButton';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import type { Page } from '../../types';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV: { page: Page; icon: IconName; label: string; title: string }[] = [
  { page: 'game', icon: 'game', label: 'Jugar', title: 'Jugar Bingo' },
  { page: 'print', icon: 'printer', label: 'Cartillas', title: 'Generar cartillas PDF' },
];

export function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <header className={styles.header}>
      {/* Logo */}
      <button className={styles.logo} onClick={() => onNavigate('home')} aria-label="Ir al inicio">
        <span className={styles.logoIcon} aria-hidden="true">
          🎯
        </span>
        <span className={styles.logoText}>
          <span className={styles.logoTitle}>Bingo de Animales</span>
          <span className={styles.logoSubtitle}>Juego educativo</span>
        </span>
      </button>

      {/* Navegación */}
      <nav className={styles.nav} aria-label="Secciones">
        {NAV.map(({ page, icon, label, title }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              className={`${styles.navBtn} ${active ? styles.active : ''}`}
              onClick={() => onNavigate(page)}
              title={title}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  className={styles.navPill}
                  layoutId="nav-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className={styles.navBtnIcon}>
                <Icon name={icon} size={19} />
              </span>
              <span className={styles.navBtnLabel}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Acciones */}
      <div className={styles.actions}>
        <ThemeToggle />
        <FullscreenButton />
      </div>
    </header>
  );
}
