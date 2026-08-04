import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';
import { History } from '../History/History';
import { Settings } from '../Settings/Settings';
import { Icon } from '../Icon/Icon';
import type { Animal } from '../../types';

type Tab = 'history' | 'settings';

interface SidebarProps {
  drawnAnimals: Animal[];
  pendingAnimals: Animal[];
  progress: number;
  total: number;
  /** Solo aplica bajo 900px, donde el panel es un cajón inferior. */
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

  const tabs: { id: Tab; label: string; icon: 'list' | 'settings' }[] = [
    { id: 'history', label: 'Historial', icon: 'list' },
    { id: 'settings', label: 'Config', icon: 'settings' },
  ];

  return (
    <>
      {/* Fondo oscuro del cajón (invisible en escritorio vía CSS) */}
      {open && (
        <button className={styles.backdrop} onClick={onClose} aria-label="Cerrar panel" tabIndex={-1} />
      )}

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
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

          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar panel">
            ×
          </button>
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
    </>
  );
}
