import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';
import { History } from '../History/History';
import { Settings } from '../Settings/Settings';
import { Icon } from '../Icon/Icon';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { Animal } from '../../types';

type Tab = 'history' | 'settings';

interface SidebarProps {
  drawnAnimals: Animal[];
  pendingAnimals: Animal[];
  progress: number;
  total: number;
  /** Solo aplica en modo cajón (bajo 900px) */
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  drawnAnimals,
  pendingAnimals,
  progress,
  total,
  open = false,
  onClose,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const isDrawer = useMediaQuery('(max-width: 900px)');

  // Cerrar con Escape / botón atrás del control remoto
  useEffect(() => {
    if (!isDrawer || !open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isDrawer, open, onClose]);

  const tabs: { id: Tab; label: string; icon: 'list' | 'settings' }[] = [
    { id: 'history', label: 'Historial', icon: 'list' },
    { id: 'settings', label: 'Config', icon: 'settings' },
  ];

  const panel = (
    <aside
      className={`${styles.sidebar} ${isDrawer ? styles.drawer : ''} ${open ? styles.open : ''}`}
      role={isDrawer ? 'dialog' : undefined}
      aria-modal={isDrawer && open ? true : undefined}
      aria-label={isDrawer ? 'Historial y configuración' : undefined}
      aria-hidden={isDrawer && !open ? true : undefined}
    >
      <div className={styles.head}>
        <div className={styles.tabs} role="tablist" aria-label="Panel del juego">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              className={`${styles.tab} ${activeTab === id ? styles.active : ''}`}
              onClick={() => setActiveTab(id)}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`panel-${id}`}
              id={`tab-${id}`}
            >
              {activeTab === id && (
                <motion.span
                  className={styles.tabPill}
                  layoutId="sidebar-tab-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className={styles.tabInner}>
                <Icon name={icon} size={17} />
                {label}
              </span>
            </button>
          ))}
        </div>

        {isDrawer && (
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar panel">
            <Icon name="collapse" size={18} />
          </button>
        )}
      </div>

      <div
        className={styles.content}
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'history' ? (
          <History
            drawnAnimals={drawnAnimals}
            pendingAnimals={pendingAnimals}
            progress={progress}
            total={total}
          />
        ) : (
          <Settings />
        )}
      </div>
    </aside>
  );

  // En escritorio el panel es una columna más del tablero.
  if (!isDrawer) return panel;

  /* En móvil se monta en <body>: dentro del tablero, el apilamiento y el
     recorte dependían de sus ancestros (`overflow: hidden`), y el fondo
     acababa por encima del contenido, tragándose los toques del botón ×. */
  return createPortal(
    <div className={`${styles.drawerRoot} ${open ? styles.open : ''}`}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      {panel}
    </div>,
    document.body
  );
}
