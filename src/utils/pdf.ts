import { PDFDocument, rgb, StandardFonts, type PDFImage } from 'pdf-lib';
import type { Animal, Cartilla } from '../types';
import { shuffle } from './shuffle';
import { ANIMALS } from '../data/animals';

/** Generate a unique Cartilla code, e.g. BA-0042 */
function makeCode(index: number): string {
  return `BA-${String(index + 1).padStart(4, '0')}`;
}

/** Build a random Cartilla (9 unique animals from the 30-animal pool). */
export function buildCartilla(index: number): Cartilla {
  const nine = shuffle(ANIMALS).slice(0, 9) as [
    Animal, Animal, Animal,
    Animal, Animal, Animal,
    Animal, Animal, Animal,
  ];
  return { code: makeCode(index), animals: nine };
}

// ── Rasterización de las ilustraciones ────────────────────────────────────────

/** Lado en píxeles del PNG intermedio (≈300 ppp para una casilla de ~77 pt) */
const RASTER_SIZE = 320;

/** Un PNG por animal, reutilizado en todas las cartillas y llamadas */
const rasterCache = new Map<number, Uint8Array>();

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('El canvas no devolvió un PNG'));
        return;
      }
      blob
        .arrayBuffer()
        .then((buf) => resolve(new Uint8Array(buf)))
        .catch(reject);
    }, 'image/png');
  });
}

/**
 * Convierte el SVG inline de un animal en un PNG.
 *
 * pdf-lib no dibuja SVG, así que la ilustración se rasteriza con el canvas
 * del navegador (nada de canvas de Node ni dependencias nuevas). Los SVG son
 * autocontenidos, por lo que el canvas no queda "tainted" y toBlob funciona.
 *
 * Devuelve null si el navegador no puede rasterizar; el llamador cae entonces
 * al dibujo con primitivas.
 */
async function rasterizeAnimal(animal: Animal, size = RASTER_SIZE): Promise<Uint8Array | null> {
  const cached = rasterCache.get(animal.id);
  if (cached) return cached;

  try {
    // Los SVG solo traen viewBox: sin width/height explícitos, Safari y
    // Firefox los dibujan vacíos dentro de un <img>.
    const markup = animal.svg.replace(/<svg\b/, `<svg width="${size}" height="${size}"`);
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));

    try {
      const img = new Image();
      img.width = size;
      img.height = size;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`No se pudo cargar el SVG de ${animal.nombre}`));
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, size, size);

      const bytes = await canvasToPngBytes(canvas);
      rasterCache.set(animal.id, bytes);
      return bytes;
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.warn(`No se pudo rasterizar "${animal.nombre}":`, err);
    return null;
  }
}

/** Embebe una sola vez cada animal usado y devuelve el mapa id → imagen. */
async function embedAnimalImages(
  pdfDoc: PDFDocument,
  animals: Animal[]
): Promise<Map<number, PDFImage>> {
  const unique = new Map(animals.map((a) => [a.id, a]));
  const images = new Map<number, PDFImage>();

  await Promise.all(
    [...unique.values()].map(async (animal) => {
      const png = await rasterizeAnimal(animal);
      if (png) images.set(animal.id, await pdfDoc.embedPng(png));
    })
  );

  return images;
}

// ── Color ─────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

/** Aclara un color hacia blanco (ratio 0 = original, 1 = blanco) */
function tint(hex: string, ratio: number): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return [r + (1 - r) * ratio, g + (1 - g) * ratio, b + (1 - b) * ratio];
}

// ── Dibujo ────────────────────────────────────────────────────────────────────

/**
 * Draw a single cartilla onto a PDFPage at (x, y) with given width/height.
 */
async function drawCartilla(
  pdfDoc: PDFDocument,
  page: Awaited<ReturnType<typeof pdfDoc.addPage>>,
  cartilla: Cartilla,
  x: number,
  y: number,
  width: number,
  height: number,
  titleFont: Awaited<ReturnType<typeof pdfDoc.embedFont>>,
  bodyFont: Awaited<ReturnType<typeof pdfDoc.embedFont>>,
  images: Map<number, PDFImage>
): Promise<void> {
  const COLS = 3;
  const ROWS = 3;

  const BORDER_W = 2;
  const HEADER_H = 36;
  const CELL_W = width / COLS;
  const CELL_H = (height - HEADER_H) / ROWS;

  /** Espacio reservado arriba (casilla de marcar) y abajo (nombre) */
  const PAD_TOP = 15;
  const PAD_BOTTOM = 15;

  // ── Outer border ─────────────────────────────────────────
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: rgb(0.2, 0.2, 0.6),
    borderWidth: BORDER_W,
    color: rgb(1, 1, 1),
  });

  // ── Header ───────────────────────────────────────────────
  page.drawRectangle({
    x,
    y: y + height - HEADER_H,
    width,
    height: HEADER_H,
    color: rgb(0.42, 0.39, 1),
  });

  const title = 'BINGO DE ANIMALES';
  const titleSize = 13;
  page.drawText(title, {
    // Centrado real, en vez de un desplazamiento fijo aproximado
    x: x + (width - titleFont.widthOfTextAtSize(title, titleSize)) / 2,
    y: y + height - HEADER_H + 14,
    size: titleSize,
    font: titleFont,
    color: rgb(1, 1, 1),
  });

  const codeSize = 7;
  page.drawText(cartilla.code, {
    x: x + width - bodyFont.widthOfTextAtSize(cartilla.code, codeSize) - 8,
    y: y + height - HEADER_H + 4,
    size: codeSize,
    font: bodyFont,
    color: rgb(0.9, 0.9, 1),
  });

  // ── Cells ────────────────────────────────────────────────
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const animal = cartilla.animals[row * COLS + col];
      const cellX = x + col * CELL_W;
      const cellY = y + (ROWS - 1 - row) * CELL_H;

      const [br, bg, bb] = tint(animal.color, 0.9);
      const [lr, lg, lb] = hexToRgb(animal.color);

      // Fondo de la casilla, teñido con el color del animal
      page.drawRectangle({
        x: cellX,
        y: cellY,
        width: CELL_W,
        height: CELL_H,
        color: rgb(br, bg, bb),
        borderColor: rgb(lr, lg, lb),
        borderWidth: 1,
      });

      // Ilustración
      const image = images.get(animal.id);
      const maxW = CELL_W - 12;
      const maxH = CELL_H - PAD_TOP - PAD_BOTTOM;
      const imgSize = Math.min(maxW, maxH);
      const imgX = cellX + (CELL_W - imgSize) / 2;
      const imgY = cellY + PAD_BOTTOM + (maxH - imgSize) / 2;

      if (image) {
        page.drawImage(image, { x: imgX, y: imgY, width: imgSize, height: imgSize });
      } else {
        // Respaldo si el navegador no pudo rasterizar el SVG
        const cx = cellX + CELL_W / 2;
        const cy = imgY + imgSize / 2;
        page.drawCircle({
          x: cx,
          y: cy,
          size: imgSize * 0.38,
          color: rgb(Math.min(lr + 0.1, 1), Math.min(lg + 0.1, 1), Math.min(lb + 0.1, 1)),
          borderColor: rgb(lr * 0.7, lg * 0.7, lb * 0.7),
          borderWidth: 1.5,
        });
        const initial = animal.nombre.charAt(0).toUpperCase();
        page.drawText(initial, {
          x: cx - titleFont.widthOfTextAtSize(initial, 14) / 2,
          y: cy - 5,
          size: 14,
          font: titleFont,
          color: rgb(1, 1, 1),
        });
      }

      // Nombre, centrado y reducido si no cabe
      let nameSize = 8;
      while (bodyFont.widthOfTextAtSize(animal.nombre, nameSize) > CELL_W - 8 && nameSize > 5) {
        nameSize -= 0.5;
      }
      page.drawText(animal.nombre, {
        x: cellX + (CELL_W - bodyFont.widthOfTextAtSize(animal.nombre, nameSize)) / 2,
        y: cellY + 5,
        size: nameSize,
        font: bodyFont,
        color: rgb(0.15, 0.15, 0.3),
      });

      // Casilla para marcar
      page.drawRectangle({
        x: cellX + CELL_W - 13,
        y: cellY + CELL_H - 13,
        width: 9,
        height: 9,
        borderColor: rgb(0.45, 0.45, 0.55),
        borderWidth: 0.8,
        color: rgb(1, 1, 1),
      });
    }
  }
}

/**
 * Generate a PDF with `count` bingo cartillas.
 * Layout: 4 cartillas per A4 page (2×2 grid).
 */
export async function generatePDF(count: number): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // A4 in points: 595 × 842
  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN = 24;
  const GAP = 12;
  const COLS_PER_PAGE = 2;
  const ROWS_PER_PAGE = 2;
  const CARDS_PER_PAGE = COLS_PER_PAGE * ROWS_PER_PAGE;

  const CARD_W = (PAGE_W - 2 * MARGIN - GAP) / COLS_PER_PAGE;
  const CARD_H = (PAGE_H - 2 * MARGIN - GAP) / ROWS_PER_PAGE;

  const cartillas: Cartilla[] = Array.from({ length: count }, (_, i) => buildCartilla(i));

  // Cada animal se rasteriza y embebe una sola vez, por muchas cartillas
  // que lo repitan: el PDF no crece con el número de cartillas.
  const images = await embedAnimalImages(
    pdfDoc,
    cartillas.flatMap((c) => c.animals)
  );

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  for (let i = 0; i < cartillas.length; i++) {
    const posOnPage = i % CARDS_PER_PAGE;

    if (posOnPage === 0 && i > 0) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    }

    const col = posOnPage % COLS_PER_PAGE;
    const row = Math.floor(posOnPage / COLS_PER_PAGE);

    const cardX = MARGIN + col * (CARD_W + GAP);
    // PDF y-axis is bottom-up; row 0 = top of page
    const cardY = PAGE_H - MARGIN - (row + 1) * CARD_H - row * GAP;

    await drawCartilla(
      pdfDoc,
      page,
      cartillas[i],
      cardX,
      cardY,
      CARD_W,
      CARD_H,
      titleFont,
      bodyFont,
      images
    );
  }

  // Footer on every page
  const pages = pdfDoc.getPages();
  pages.forEach((p, idx) => {
    p.drawText(`Bingo de Animales · Página ${idx + 1} de ${pages.length}`, {
      x: MARGIN,
      y: 10,
      size: 7,
      font: bodyFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  return pdfDoc.save();
}

/** Trigger browser download of a PDF Uint8Array. */
export function downloadPDF(bytes: Uint8Array, filename = 'bingo-animales.pdf'): void {
  // pdf-lib may return a SharedArrayBuffer-backed Uint8Array; copy to a plain ArrayBuffer
  const rawBuffer = bytes.buffer as ArrayBuffer;
  const buffer = rawBuffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
