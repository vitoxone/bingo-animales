import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Settings.module.css';
import { Icon } from '../Icon/Icon';
import { useSettings } from '../../context/SettingsContext';
import { isFullscreenSupported } from '../../utils/fullscreen';
import type { CountdownSeconds, ShowingSeconds, GameMode, Theme } from '../../types';

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const [saved, setSaved] = useState(false);
  const fullscreenSupported = isFullscreenSupported();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function set<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    updateSettings({ [key]: value });
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 1600);
  }

  // Sin esto, el timeout dispara setState sobre un componente desmontado
  // al cambiar de pestaña justo después de tocar un ajuste.
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <div className={styles.panel}>
      {/* Tiempos */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>
          <Icon name="clock" size={15} />
          Tiempos
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Cuenta regresiva</span>
          <div className={styles.segment} role="group" aria-label="Segundos de cuenta regresiva">
            {([2, 3, 4, 5] as CountdownSeconds[]).map((s) => (
              <button
                key={s}
                className={`${styles.segmentBtn} ${settings.countdownSeconds === s ? styles.selected : ''}`}
                onClick={() => set('countdownSeconds', s)}
                aria-pressed={settings.countdownSeconds === s}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Tiempo visible del animal</span>
          <div className={styles.segment} role="group" aria-label="Segundos que se ve el animal">
            {([3, 5, 8, 10] as ShowingSeconds[]).map((s) => (
              <button
                key={s}
                className={`${styles.segmentBtn} ${settings.showingSeconds === s ? styles.selected : ''}`}
                onClick={() => set('showingSeconds', s)}
                aria-pressed={settings.showingSeconds === s}
              >
                {s}s
              </button>
            ))}
          </div>
          <span className={styles.hint}>Solo se usa en el modo automático.</span>
        </div>
      </div>

      {/* Modo */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>
          <Icon name="game" size={15} />
          Modo de juego
        </div>

        <div className={styles.field}>
          <div className={styles.segment} role="group" aria-label="Modo de avance">
            {(['manual', 'auto'] as GameMode[]).map((m) => (
              <button
                key={m}
                className={`${styles.segmentBtn} ${settings.mode === m ? styles.selected : ''}`}
                onClick={() => set('mode', m)}
                aria-pressed={settings.mode === m}
              >
                <Icon name={m === 'manual' ? 'next' : 'skip'} size={16} />
                {m === 'manual' ? 'Manual' : 'Automático'}
              </button>
            ))}
          </div>
          <span className={styles.hint}>
            {settings.mode === 'manual'
              ? 'Tú decides cuándo pasa al siguiente animal.'
              : `Avanza solo cada ${settings.showingSeconds} segundos.`}
          </span>
        </div>
      </div>

      {/* Apariencia */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>
          <Icon name="sun" size={15} />
          Apariencia
        </div>

        <div className={styles.field}>
          <div className={styles.segment} role="group" aria-label="Tema de color">
            {(
              [
                { id: 'system', label: 'Auto', icon: 'monitor' },
                { id: 'light', label: 'Claro', icon: 'sun' },
                { id: 'dark', label: 'Oscuro', icon: 'moon' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                className={`${styles.segmentBtn} ${settings.theme === t.id ? styles.selected : ''}`}
                onClick={() => set('theme', t.id as Theme)}
                aria-pressed={settings.theme === t.id}
              >
                <Icon name={t.icon} size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Toggle
          label="Mostrar el nombre del animal"
          value={settings.showName}
          onChange={(v) => set('showName', v)}
        />
      </div>

      {/* Otros */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>
          <Icon name="settings" size={15} />
          Opciones
        </div>

        <Toggle
          label="Sonidos"
          value={settings.soundEnabled}
          onChange={(v) => set('soundEnabled', v)}
        />
        {fullscreenSupported && (
          <Toggle
            label="Pantalla completa automática"
            value={settings.autoFullscreen}
            onChange={(v) => set('autoFullscreen', v)}
          />
        )}
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div
            className={styles.saved}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            aria-live="polite"
          >
            <Icon name="check" size={14} />
            Guardado
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Internal Toggle component ─────────────────────────────────────────────────

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <div className={styles.toggle}>
      <span className={styles.toggleText}>
        <span className={styles.toggleLabel}>{label}</span>
      </span>
      <button
        className={`${styles.toggleTrack} ${value ? styles.on : ''}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}
