import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PDFGenerator.module.css';
import { Icon } from '../Icon/Icon';
import { generatePDF, downloadPDF, buildCartilla } from '../../utils/pdf';
import type { Cartilla } from '../../types';

const COUNT_OPTIONS = [1, 2, 5, 10, 20, 50, 100] as const;
type CountOption = (typeof COUNT_OPTIONS)[number];

export function PDFGenerator() {
  const [selectedCount, setSelectedCount] = useState<CountOption>(5);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** `seed` solo sirve para reanimar la muestra al regenerarla */
  const [preview, setPreview] = useState<{ seed: number; cartilla: Cartilla }>(() => ({
    seed: 0,
    cartilla: buildCartilla(0),
  }));
  const previewCartilla = preview.cartilla;

  const pages = Math.ceil(selectedCount / 4);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      const bytes = await generatePDF(selectedCount);
      downloadPDF(bytes, `bingo-animales-${selectedCount}-cartillas.pdf`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Error generando PDF:', err);
      // Un alert() bloquea la página entera y en Smart TV es casi
      // imposible de cerrar con el control remoto.
      setError('No se pudo generar el PDF. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [selectedCount]);

  return (
    <div className={styles.wrapper}>
      {/* Encabezado */}
      <header className={styles.head}>
        <span className={styles.headIcon} aria-hidden="true">
          <Icon name="printer" size={30} />
        </span>
        <h1 className={styles.title}>Generador de Cartillas</h1>
        <p className={styles.subtitle}>
          Cartillas de 9 animales en formato A4, cuatro por hoja, listas para recortar y repartir.
        </p>
      </header>

      <div className={styles.grid}>
        {/* Configuración */}
        <div className={styles.card}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>¿Cuántas cartillas quieres?</span>
            <div className={styles.optionGrid}>
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  className={`${styles.optionBtn} ${selectedCount === n ? styles.selected : ''}`}
                  onClick={() => setSelectedCount(n)}
                  aria-pressed={selectedCount === n}
                >
                  <span className={styles.optionNumber}>{n}</span>
                  <span className={styles.optionLabel}>{n === 1 ? 'cartilla' : 'cartillas'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{selectedCount}</span>
              <span className={styles.summaryLabel}>
                {selectedCount === 1 ? 'Cartilla' : 'Cartillas'}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{pages}</span>
              <span className={styles.summaryLabel}>{pages === 1 ? 'Hoja A4' : 'Hojas A4'}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>3 × 3</span>
              <span className={styles.summaryLabel}>Grilla</span>
            </div>
          </div>

          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Generando PDF…
              </>
            ) : (
              <>
                <Icon name="download" size={22} />
                Generar y descargar
              </>
            )}
          </button>

          <AnimatePresence>
            {success && (
              <motion.div
                className={`${styles.message} ${styles.success}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                role="status"
                aria-live="polite"
              >
                <Icon name="check" size={18} />
                ¡Listo! Revisa tu carpeta de descargas.
              </motion.div>
            )}
            {error && (
              <motion.div
                className={`${styles.message} ${styles.error}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                role="alert"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vista previa */}
        <aside className={styles.previewPanel}>
          <div className={styles.previewTitle}>
            Vista previa
            <button
              className={styles.shuffleBtn}
              onClick={() => setPreview((p) => ({ seed: p.seed + 1, cartilla: buildCartilla(0) }))}
              aria-label="Generar otra cartilla de muestra"
            >
              <Icon name="refresh" size={13} />
              Otra
            </button>
          </div>

          <motion.div
            key={preview.seed}
            className={styles.previewCartilla}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.previewHeader}>
              <span className={styles.previewHeaderTitle}>BINGO DE ANIMALES</span>
              <span className={styles.previewCode}>{previewCartilla.code}</span>
            </div>
            <div className={styles.previewGrid}>
              {previewCartilla.animals.map((animal) => (
                <div
                  key={animal.id}
                  className={styles.previewCell}
                  style={{ borderColor: animal.color }}
                >
                  <div
                    className={styles.previewCellSvg}
                    dangerouslySetInnerHTML={{ __html: animal.svg }}
                  />
                  <span className={styles.previewCellName}>{animal.nombre}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <p className={styles.previewNote}>
            Cada cartilla lleva 9 animales al azar, con su ilustración, su nombre y una casilla
            para marcar. El código único ayuda a repartirlas sin confusiones.
          </p>
        </aside>
      </div>
    </div>
  );
}
