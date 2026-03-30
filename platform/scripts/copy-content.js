/**
 * Copies exercise and guide files into public/raw/ so they're
 * available as static assets in production builds.
 *
 * Run before `vite build` via the "prebuild" npm script.
 */

import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DEST = resolve(__dirname, '..', 'public', 'raw');

// Clean previous copy
if (existsSync(DEST)) {
  rmSync(DEST, { recursive: true });
}
mkdirSync(DEST, { recursive: true });

// Directories to copy (relative to repo root)
const sources = [
  'src/01-fundamentals',
  'src/02-hooks',
  'arguments/chapters',
];

for (const src of sources) {
  const from = resolve(ROOT, src);
  const to = resolve(DEST, src);
  if (existsSync(from)) {
    cpSync(from, to, { recursive: true });
    console.log(`  Copied ${src}`);
  } else {
    console.warn(`  Skipped ${src} (not found)`);
  }
}

console.log('Content files copied to public/raw/');
