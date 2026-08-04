/**
 * Regenera src/data/animals.ts a partir de las ilustraciones de OpenMoji.
 *
 *   node scripts/generate-animals.mjs
 *
 * Descarga los SVG originales a assets/openmoji/ (fuente + licencia) y los
 * incrusta en animals.ts dentro de un lienzo 200×200 con el fondo redondeado
 * de cada animal, que es lo que espera la UI.
 *
 * OpenMoji — CC BY-SA 4.0 · https://openmoji.org
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SVG_DIR = path.join(ROOT, 'assets', 'openmoji');
const OUT_FILE = path.join(ROOT, 'src', 'data', 'animals.ts');
const CDN = 'https://cdn.jsdelivr.net/npm/openmoji@latest/color/svg';

/** id → [nombre, codepoint OpenMoji, color, colorDark, fondo] */
const ANIMALS = [
  [1, 'Perro', '1F415', '#F4A460', '#C4813A', '#FFF8EE'],
  [2, 'Gato', '1F408', '#A78BFA', '#7C5CD6', '#F5F0FF'],
  [3, 'Caballo', '1F40E', '#B5651D', '#8A4A12', '#FFF3E6'],
  [4, 'Vaca', '1F404', '#94A3B8', '#64748B', '#F4F7FB'],
  [5, 'Cerdo', '1F416', '#FF9BB3', '#E5708D', '#FFF0F4'],
  [6, 'Oveja', '1F411', '#CBD5E1', '#94A3B8', '#F8FAFC'],
  [7, 'Cabra', '1F410', '#D6C7A1', '#A89571', '#FBF8F0'],
  [8, 'Burro', '1FACE', '#9CA3AF', '#6B7280', '#F6F7F9'],
  [9, 'Conejo', '1F407', '#F9A8D4', '#DB7BAC', '#FFF3F9'],
  [10, 'Gallina', '1F414', '#FBBF24', '#D19307', '#FFFBEB'],
  [11, 'Gallo', '1F413', '#EF4444', '#B91C1C', '#FFF1F1'],
  [12, 'Pollito', '1F424', '#FDE047', '#CA9A04', '#FEFCE8'],
  [13, 'Pato', '1F986', '#60A5FA', '#2563EB', '#EFF6FF'],
  [14, 'Pavo', '1F983', '#C2410C', '#9A3412', '#FFF4ED'],
  [15, 'Oca', '1FABF', '#E2E8F0', '#94A3B8', '#F8FAFC'],
  [16, 'Ballena', '1F433', '#3B82F6', '#1D4ED8', '#EFF6FF'],
  [17, 'León', '1F981', '#F59E0B', '#B45309', '#FFFBEB'],
  [18, 'Tigre', '1F405', '#F97316', '#C2410C', '#FFF7ED'],
  [19, 'Elefante', '1F418', '#94A3B8', '#64748B', '#F4F7FB'],
  [20, 'Mono', '1F412', '#A16207', '#78350F', '#FEFCE8'],
  [21, 'Jirafa', '1F992', '#FCD34D', '#D97706', '#FFFBEB'],
  [22, 'Cebra', '1F993', '#475569', '#1E293B', '#F8FAFC'],
  [23, 'Oso', '1F43B', '#92400E', '#78350F', '#FDF6EC'],
  [24, 'Panda', '1F43C', '#334155', '#0F172A', '#F8FAFC'],
  [25, 'Pingüino', '1F427', '#1E293B', '#0F172A', '#F1F5F9'],
  [26, 'Delfín', '1F42C', '#38BDF8', '#0284C7', '#F0F9FF'],
  [27, 'Tortuga', '1F422', '#22C55E', '#15803D', '#F0FDF4'],
  [28, 'Rana', '1F438', '#4ADE80', '#16A34A', '#F0FDF4'],
  [29, 'Zorro', '1F98A', '#FB923C', '#EA580C', '#FFF7ED'],
  [30, 'Ardilla', '1F43F', '#B45309', '#92400E', '#FEF6E7'],
];

async function fetchSvg(codepoint) {
  const file = path.join(SVG_DIR, `${codepoint}.svg`);
  if (existsSync(file)) return readFile(file, 'utf8');

  const res = await fetch(`${CDN}/${codepoint}.svg`);
  if (!res.ok) throw new Error(`${codepoint}: HTTP ${res.status}`);
  const svg = await res.text();
  await writeFile(file, svg, 'utf8');
  return svg;
}

/**
 * Extrae el contenido del <svg> y lo deja listo para incrustar:
 * - quita <title>/comentarios (ruido en el bundle)
 * - prefija los id para que 30 SVG inline en la misma página no choquen
 */
function prepare(svg, id) {
  let inner = svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .trim();

  const ids = [...inner.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const original of new Set(ids)) {
    const scoped = `a${id}-${original}`;
    const esc = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    inner = inner
      .replace(new RegExp(`\\sid="${esc}"`, 'g'), ` id="${scoped}"`)
      .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${scoped})`)
      .replace(new RegExp(`href="#${esc}"`, 'g'), `href="#${scoped}"`);
  }

  return inner.replace(/>\s+</g, '><');
}

const SCALE = 156 / 72; // el arte de OpenMoji vive en un lienzo de 72×72
const OFFSET = (200 - 156) / 2;

const entries = [];

for (const [id, nombre, cp, color, colorDark, bg] of ANIMALS) {
  const art = prepare(await fetchSvg(cp), id);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
    `<rect width="200" height="200" rx="30" fill="${bg}"/>` +
    `<g transform="translate(${OFFSET} ${OFFSET}) scale(${SCALE.toFixed(4)})">${art}</g>` +
    `</svg>`;

  entries.push(
    `  {\n` +
      `    id: ${id},\n` +
      `    nombre: '${nombre}',\n` +
      `    color: '${color}',\n` +
      `    colorDark: '${colorDark}',\n` +
      `    svg: \`${svg}\`,\n` +
      `  },`
  );
  console.log(`✓ ${nombre} (${cp})`);
}

const header = `import type { Animal } from '../types';

// ============================================================
// GENERADO POR scripts/generate-animals.mjs — NO EDITAR A MANO
//
// Ilustraciones: OpenMoji (https://openmoji.org) — CC BY-SA 4.0.
// Los SVG originales están en assets/openmoji/ junto a su licencia.
// Cada uno va incrustado en un lienzo 200×200 con el fondo del animal.
// ============================================================

export const ANIMALS: Animal[] = [
`;

await mkdir(SVG_DIR, { recursive: true });
await writeFile(OUT_FILE, `${header}${entries.join('\n')}\n];\n`, 'utf8');
console.log(`\n${ANIMALS.length} animales escritos en src/data/animals.ts`);
