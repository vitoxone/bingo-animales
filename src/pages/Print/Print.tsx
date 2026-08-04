import React from 'react';
import styles from './Print.module.css';
import { PDFGenerator } from '../../components/PDFGenerator/PDFGenerator';

export function Print() {
  return (
    <main className={styles.page}>
      <PDFGenerator />
    </main>
  );
}
