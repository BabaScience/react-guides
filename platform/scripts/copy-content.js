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
  'src/03-component-patterns',
  'src/04-styling',
  'src/05-routing',
  'src/06-state-management',
  'src/07-data-fetching',
  'src/08-forms',
  'src/09-performance',
  'src/10-testing',
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

// React + ReactDOM type declarations. The CodeEditor fetches these at runtime
// to feed Monaco for IDE-quality JSX/HTML autocomplete. They live in
// node_modules so we must publish them as static assets for the production
// build; the dev-server middleware can read them from disk directly.
const TYPE_FILES = [
  'platform/node_modules/@types/react/index.d.ts',
  'platform/node_modules/@types/react/global.d.ts',
  'platform/node_modules/@types/react/jsx-runtime.d.ts',
  'platform/node_modules/@types/react-dom/index.d.ts',
  'platform/node_modules/@types/react-dom/client.d.ts',
];

for (const src of TYPE_FILES) {
  const from = resolve(ROOT, src);
  const to = resolve(DEST, src);
  if (existsSync(from)) {
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to);
    console.log(`  Copied ${src}`);
  } else {
    console.warn(`  Skipped ${src} (not found)`);
  }
}

console.log('Content files copied to public/raw/');
