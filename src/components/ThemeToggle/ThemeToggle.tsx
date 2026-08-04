import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './ThemeToggle.module.css';
import { Icon, type IconName } from '../Icon/Icon';
import { useSettings } from '../../context/SettingsContext';
import type { Theme } from '../../types';

const ORDER: Theme[] = ['system', 'light', 'dark'];

const META: Record<Theme, { icon: IconName; label: string }> = {
  system: { icon: 'monitor', label: 'Tema: automático (sigue al sistema)' },
  light: { icon: 'sun', label: 'Tema: claro' },
  dark: { icon: 'moon', label: 'Tema: oscuro' },
};

/** Botón que cicla automático → claro → oscuro. */
export function ThemeToggle() {
  const { settings, updateSettings } = useSettings();
  const current = settings.theme;
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];

  return (
    <button
      className={styles.btn}
      onClick={() => updateSettings({ theme: next })}
      title={`${META[current].label}. Cambiar a ${META[next].label.replace('Tema: ', '')}`}
      aria-label={`${META[current].label}. Pulsa para cambiar.`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          className={styles.icon}
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ duration: 0.18 }}
        >
          <Icon name={META[current].icon} size={22} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
