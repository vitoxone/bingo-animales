import React from 'react';
import { motion } from 'framer-motion';
import styles from './Home.module.css';
import { ANIMALS } from '../../data/animals';
import { Icon } from '../../components/Icon/Icon';
import type { Page } from '../../types';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

/** El carrusel repite la lista dos veces para poder desplazarse sin costuras. */
const STRIP_ANIMALS = ANIMALS.slice(0, 15);

const FEATURES = [
  { icon: '🐾', title: `${ANIMALS.length} animales`, desc: 'Ilustraciones originales y coloridas' },
  { icon: '⏱️', title: 'Configurable', desc: 'Tiempos, modo manual o automático' },
  { icon: '📄', title: 'Cartillas PDF', desc: 'Hasta 100 cartillas listas para imprimir' },
  { icon: '📺', title: 'Smart TV', desc: 'Se maneja entero con el control remoto' },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function Home({ onNavigate }: HomeProps) {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <motion.section
        className={styles.hero}
        initial="hidden"
        animate="show"
        variants={fade}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          Funciona sin conexión
        </span>

        <div className={styles.heroLogo} aria-hidden="true">
          🎯
        </div>

        <h1 className={styles.heroTitle}>Bingo de Animales</h1>

        <p className={styles.heroSubtitle}>
          El juego educativo que enseña a los niños los nombres de los animales de una forma
          divertida y emocionante.
        </p>
      </motion.section>

      {/* Carrusel de animales */}
      <motion.div
        className={styles.strip}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <div className={styles.stripTrack}>
          {[...STRIP_ANIMALS, ...STRIP_ANIMALS].map((animal, i) => (
            <div
              key={`${animal.id}-${i}`}
              className={styles.stripCard}
              style={{ borderColor: animal.color }}
              dangerouslySetInnerHTML={{ __html: animal.svg }}
            />
          ))}
        </div>
      </motion.div>

      {/* Acciones */}
      <motion.div
        className={styles.actions}
        initial="hidden"
        animate="show"
        variants={fade}
        transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          className={styles.btnPrimary}
          onClick={() => onNavigate('game')}
          autoFocus
          aria-label="Comenzar un nuevo bingo"
        >
          <Icon name="play" size={22} />
          Nuevo Bingo
        </button>

        <button
          className={styles.btnSecondary}
          onClick={() => onNavigate('print')}
          aria-label="Generar cartillas en PDF"
        >
          <Icon name="printer" size={20} />
          Generar Cartillas
        </button>
      </motion.div>

      {/* Características */}
      <motion.section
        className={styles.features}
        initial="hidden"
        animate="show"
        variants={fade}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Características del juego"
      >
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">
              {f.icon}
            </span>
            <span className={styles.featureTitle}>{f.title}</span>
            <span className={styles.featureDesc}>{f.desc}</span>
          </div>
        ))}
      </motion.section>

      {/* Atajos */}
      <div className={styles.shortcuts}>
        <span className={styles.shortcut}>
          <kbd>Enter</kbd> Comenzar
        </span>
        <span className={styles.shortcut}>
          <kbd>←</kbd>
          <kbd>→</kbd> Navegar
        </span>
        <span className={styles.shortcut}>
          <kbd>F</kbd> Pantalla completa
        </span>
      </div>

      {/* Atribución exigida por la licencia CC BY-SA 4.0 de OpenMoji */}
      <p className={styles.credits}>
        Ilustraciones de{' '}
        <a href="https://openmoji.org" target="_blank" rel="noreferrer noopener">
          OpenMoji
        </a>{' '}
        · CC BY-SA 4.0
      </p>
    </main>
  );
}
