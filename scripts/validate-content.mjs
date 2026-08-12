#!/usr/bin/env node
/**
 * Content validator.
 *
 * The platform joins three independently-maintained sources of truth:
 *
 *   1. markdown chapters       arguments/chapters/**.md
 *   2. module metadata         platform/src/data/*.ts
 *   3. UI translations         platform/src/i18n/locales/*.json
 *
 * They are wired together by string matching (H2 text, `// EXERCISE N:` banners,
 * `t()` key paths). Nothing at runtime tells you when a join breaks — a lesson
 * just renders an error, or a whole section becomes unreachable. This script is
 * that missing check. Run it in CI.
 *
 * Usage:
 *   node scripts/validate-content.mjs             # exit 1 on any error
 *   node scripts/validate-content.mjs --warn-only # always exit 0
 *   node scripts/validate-content.mjs --verbose   # also print passing checks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PLATFORM = path.join(ROOT, 'platform');

const WARN_ONLY = process.argv.includes('--warn-only');
const VERBOSE = process.argv.includes('--verbose');

const LOCALES = ['en', 'fr', 'it'];
/** H2s that intentionally have no step — the timeline replaces them. */
const IGNORED_HEADINGS = new Set(['Table of Contents']);

// ---------------------------------------------------------------- diagnostics

const errors = [];
const warnings = [];
const passed = [];

const err = (check, msg) => errors.push({ check, msg });
const warn = (check, msg) => warnings.push({ check, msg });
const ok = (check, msg) => passed.push({ check, msg });

// ------------------------------------------------------------------- loading

/** Bundle the TS module graph so we can read the real `modules` array. */
function loadModules() {
  const require = createRequire(path.join(PLATFORM, 'package.json'));
  let esbuild;
  try {
    esbuild = require('esbuild');
  } catch {
    console.error(
      'esbuild not found. Run `npm install` in platform/ first ' +
        '(esbuild ships with vite).'
    );
    process.exit(2);
  }
  const outfile = path.join(
    fs.mkdtempSync(path.join(require('os').tmpdir(), 'validate-content-')),
    'modules.cjs'
  );
  esbuild.buildSync({
    entryPoints: [path.join(PLATFORM, 'src/data/modules.ts')],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile,
    alias: { '@': path.join(PLATFORM, 'src') },
    logLevel: 'error',
  });
  return require(outfile).modules;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** H2 headings of a markdown file, in document order. */
function headings(markdown) {
  return markdown
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => l.replace(/^## /, '').trim());
}

/** Absolute path of a guide file for a given locale. */
function guidePath(guideFile, locale) {
  return locale === 'en'
    ? path.join(ROOT, guideFile)
    : path.join(
        ROOT,
        guideFile.replace('arguments/chapters/', `arguments/chapters/${locale}/`)
      );
}

// ------------------------------------------------------------------ the checks

function checkIdentity(modules) {
  const seenIds = new Set();
  const seenTrackNumber = new Set();
  for (const m of modules) {
    if (seenIds.has(m.id)) err('identity', `duplicate module id: ${m.id}`);
    seenIds.add(m.id);

    const key = `${m.track}#${m.number}`;
    if (seenTrackNumber.has(key))
      err('identity', `duplicate (track, number): ${m.track} #${m.number} (${m.id})`);
    seenTrackNumber.add(key);

    const stepIds = new Set();
    for (const s of m.steps) {
      if (stepIds.has(s.id)) err('identity', `${m.id}: duplicate step id "${s.id}"`);
      stepIds.add(s.id);
    }
    const exIds = new Set();
    for (const e of m.exercises) {
      if (exIds.has(e.id)) err('identity', `${m.id}: duplicate exercise id "${e.id}"`);
      exIds.add(e.id);
    }
  }
  ok('identity', `${modules.length} modules, ids and (track, number) pairs unique`);
}

function checkGuideFiles(modules) {
  for (const m of modules) {
    if (!m.guideFile) {
      if (m.status === 'available')
        err('guides', `${m.id}: status "available" but guideFile is empty`);
      continue;
    }
    if (!fs.existsSync(guidePath(m.guideFile, 'en')))
      err('guides', `${m.id}: guideFile not on disk — ${m.guideFile}`);
  }
}

/**
 * Sections resolve by ordinal: we look the heading up in the ENGLISH chapter to
 * get its index, then take the same index from the localized chapter. That only
 * works if translations keep every H2, in order — so assert it.
 */
function checkHeadingParity(modules) {
  let compared = 0;
  const missingTranslations = { fr: [], it: [] };

  for (const m of modules) {
    if (!m.guideFile) continue;
    const enPath = guidePath(m.guideFile, 'en');
    if (!fs.existsSync(enPath)) continue;
    const en = headings(fs.readFileSync(enPath, 'utf8'));

    for (const locale of LOCALES.filter((l) => l !== 'en')) {
      const p = guidePath(m.guideFile, locale);
      if (!fs.existsSync(p)) {
        missingTranslations[locale].push(m.id);
        continue;
      }
      compared++;
      const loc = headings(fs.readFileSync(p, 'utf8'));
      if (loc.length !== en.length) {
        err(
          'heading-parity',
          `${m.id} [${locale}]: ${loc.length} H2 headings vs ${en.length} in English — ` +
            `ordinal section lookup would return the wrong section`
        );
      }
    }
  }

  for (const [locale, ids] of Object.entries(missingTranslations)) {
    if (ids.length)
      warn(
        'heading-parity',
        `${ids.length} modules have no ${locale} chapter (English fallback): ${ids.join(', ')}`
      );
  }
  ok('heading-parity', `${compared} translated chapters match English H2 structure`);
}

function checkSectionResolution(modules) {
  let resolved = 0;

  for (const m of modules) {
    if (!m.guideFile) continue;
    const enPath = guidePath(m.guideFile, 'en');
    if (!fs.existsSync(enPath)) continue;
    const en = headings(fs.readFileSync(enPath, 'utf8'));

    // 1. every lesson step resolves to exactly one English H2
    const usedIndexes = new Map();
    for (const step of m.steps) {
      if (step.type !== 'lesson') continue;
      const matches = en
        .map((h, i) => (h === step.sectionHeading ? i : -1))
        .filter((i) => i !== -1);

      if (matches.length === 0) {
        const near = en.find(
          (h) =>
            h.toLowerCase().includes(step.sectionHeading.toLowerCase()) ||
            step.sectionHeading.toLowerCase().includes(h.toLowerCase())
        );
        err(
          'sections',
          `${m.id}/${step.id}: sectionHeading "${step.sectionHeading}" matches no H2` +
            (near ? ` — did you mean "${near}"?` : '')
        );
        continue;
      }
      if (matches.length > 1) {
        err(
          'sections',
          `${m.id}/${step.id}: sectionHeading "${step.sectionHeading}" matches ${matches.length} H2s`
        );
        continue;
      }
      const idx = matches[0];
      if (usedIndexes.has(idx)) {
        err(
          'sections',
          `${m.id}: steps "${usedIndexes.get(idx)}" and "${step.id}" both point at "${en[idx]}"`
        );
      }
      usedIndexes.set(idx, step.id);
      resolved++;
    }

    // 2. every H2 is reachable from the timeline
    if (m.steps.length === 0) continue; // coming-soon modules
    const orphans = en.filter((h, i) => !usedIndexes.has(i) && !IGNORED_HEADINGS.has(h));
    if (orphans.length) {
      err(
        'sections',
        `${m.id}: ${orphans.length} section(s) written but unreachable — ` +
          orphans.map((h) => `"${h}"`).join(', ')
      );
    }
  }

  ok('sections', `${resolved} lesson steps resolve to exactly one section`);
}

function checkExercises(modules) {
  let checked = 0;

  for (const m of modules) {
    const stepExerciseIds = m.steps.filter((s) => s.type === 'exercise').map((s) => s.id);

    if (m.exercises.length === 0) {
      if (stepExerciseIds.length)
        err(
          'exercises',
          `${m.id}: timeline references exercises [${stepExerciseIds.join(', ')}] but module.exercises is empty`
        );
      continue;
    }

    // steps <-> exercises must be 1:1
    for (const id of stepExerciseIds)
      if (!m.exercises.some((e) => e.id === id))
        err('exercises', `${m.id}: step "${id}" has no matching entry in module.exercises`);
    for (const e of m.exercises)
      if (!stepExerciseIds.includes(e.id))
        err('exercises', `${m.id}/${e.id}: exercise is not in the step timeline — unreachable`);

    const dir = path.join(ROOT, m.exerciseDir);
    if (!fs.existsSync(dir)) {
      err('exercises', `${m.id}: exerciseDir missing — ${m.exerciseDir}`);
      continue;
    }
    const stubPath = path.join(dir, 'index.tsx');
    const testPath = path.join(dir, 'index.test.tsx');
    if (!fs.existsSync(stubPath)) {
      err('exercises', `${m.id}: no index.tsx in ${m.exerciseDir}`);
      continue;
    }
    if (!fs.existsSync(testPath)) {
      err('exercises', `${m.id}: no index.test.tsx in ${m.exerciseDir}`);
      continue;
    }

    const stub = fs.readFileSync(stubPath, 'utf8');
    const tests = fs.readFileSync(testPath, 'utf8');
    const banners = [...stub.matchAll(/^\/\/\s*EXERCISE\s+(\d+)\s*:/gim)].map((x) => +x[1]);

    for (const e of m.exercises) {
      checked++;

      if (!banners.includes(e.number))
        err(
          'exercises',
          `${m.id}/${e.id}: no "// EXERCISE ${e.number}:" banner in index.tsx — ` +
            `the editor would silently load the whole file`
        );

      const name = e.componentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const isExported =
        new RegExp(`export\\s+(?:default\\s+)?(?:async\\s+)?(?:const|let|var|function|class)\\s+${name}\\b`).test(stub) ||
        new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`).test(stub);
      if (!isExported)
        err(
          'exercises',
          `${m.id}/${e.id}: componentName "${e.componentName}" is not exported from index.tsx`
        );

      if (!new RegExp(`describe\\s*\\(\\s*['"\`]\\s*Exercise\\s+${e.number}\\b`, 'i').test(tests))
        err(
          'exercises',
          `${m.id}/${e.id}: no describe("Exercise ${e.number} …") block in index.test.tsx — 0 tests would run`
        );
    }
  }

  ok('exercises', `${checked} exercises wired to a banner, an export and a test block`);
}

function checkTranslations(modules) {
  const res = Object.fromEntries(
    LOCALES.map((l) => [l, readJson(path.join(PLATFORM, `src/i18n/locales/${l}.json`))])
  );

  // key parity across locale files
  const flat = (o, prefix = '') =>
    Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${prefix}${k}.`) : [`${prefix}${k}`]
    );
  const enKeys = new Set(flat(res.en));
  for (const l of LOCALES.filter((x) => x !== 'en')) {
    const keys = new Set(flat(res[l]));
    const missing = [...enKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !enKeys.has(k));
    if (missing.length)
      err('i18n', `${l}.json is missing ${missing.length} keys present in en.json: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ' …' : ''}`);
    if (extra.length)
      err('i18n', `${l}.json has ${extra.length} keys absent from en.json: ${extra.slice(0, 8).join(', ')}${extra.length > 8 ? ' …' : ''}`);
  }

  // every id the UI renders has a key
  const missing = { module: [], step: [], exercise: [] };
  for (const m of modules) {
    for (const l of LOCALES) {
      if (!res[l].modules?.[m.id]) missing.module.push(`${l}:${m.id}`);
      for (const s of m.steps)
        if (!res[l].steps?.[m.id]?.[s.id]) missing.step.push(`${l}:${m.id}/${s.id}`);
      for (const e of m.exercises)
        if (!res[l].exercises?.[m.id]?.[e.id]) missing.exercise.push(`${l}:${m.id}/${e.id}`);
    }
  }
  for (const [kind, list] of Object.entries(missing)) {
    if (!list.length) continue;
    const unique = [...new Set(list.map((x) => x.slice(x.indexOf(':') + 1)))];
    err(
      'i18n',
      `${list.length} missing ${kind} translation keys (${unique.length} distinct): ` +
        `${unique.slice(0, 10).join(', ')}${unique.length > 10 ? ' …' : ''}`
    );
  }

  // Hint text lives only in the locale files. Every exercise needs hints in
  // every locale, and the counts must line up — a translator dropping one is
  // invisible at runtime because i18next just returns a shorter array.
  for (const m of modules)
    for (const e of m.exercises) {
      const counts = LOCALES.map((l) => res[l].exercises?.[m.id]?.[e.id]?.hints?.length);
      if (counts.some((c) => c === undefined)) {
        err(
          'i18n',
          `${m.id}/${e.id}: missing hints in ${LOCALES.filter((_, i) => counts[i] === undefined).join(', ')}`
        );
        continue;
      }
      if (new Set(counts).size > 1)
        err(
          'i18n',
          `${m.id}/${e.id}: hint count differs — ${LOCALES.map((l, i) => `${l}=${counts[i]}`).join(', ')}`
        );
    }

  // keys with no module behind them
  const orphan = Object.keys(res.en.modules || {}).filter((k) => !modules.some((m) => m.id === k));
  if (orphan.length) warn('i18n', `locale keys for unknown modules: ${orphan.join(', ')}`);

  ok('i18n', `${LOCALES.length} locales in key parity and covering every module/step/exercise`);
}

function checkBuildInputs(modules) {
  const src = fs.readFileSync(path.join(PLATFORM, 'scripts/copy-content.js'), 'utf8');
  const listed = [...src.matchAll(/^\s*'([^']+)',\s*$/gm)].map((x) => x[1]);

  const needed = [...new Set(modules.filter((m) => m.exercises.length).map((m) => m.exerciseDir))];
  const notCopied = needed.filter((d) => !listed.includes(d));
  if (notCopied.length)
    err(
      'build',
      `exerciseDirs absent from copy-content.js — these 404 in production only: ${notCopied.join(', ')}`
    );

  const stale = listed.filter((d) => d.startsWith('src/') && !fs.existsSync(path.join(ROOT, d)));
  if (stale.length) warn('build', `copy-content.js lists directories that do not exist: ${stale.join(', ')}`);

  ok('build', `${needed.length} exercise directories are copied into the production bundle`);
}

function checkEncoding() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.md')) files.push(p);
    }
  };
  walk(path.join(ROOT, 'arguments'));

  const bom = [];
  const crlf = [];
  for (const f of files) {
    const buf = fs.readFileSync(f);
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) bom.push(path.relative(ROOT, f));
    if (buf.includes('\r\n')) crlf.push(path.relative(ROOT, f));
  }
  if (bom.length) err('encoding', `${bom.length} chapter(s) start with a UTF-8 BOM: ${bom.slice(0, 5).join(', ')}${bom.length > 5 ? ' …' : ''}`);
  if (crlf.length) err('encoding', `${crlf.length} chapter(s) use CRLF line endings: ${crlf.slice(0, 5).join(', ')}${crlf.length > 5 ? ' …' : ''}`);

  ok('encoding', `${files.length} chapters are UTF-8 without BOM, LF line endings`);
}

// ---------------------------------------------------------------------- main

const modules = loadModules();

checkIdentity(modules);
checkGuideFiles(modules);
checkHeadingParity(modules);
checkSectionResolution(modules);
checkExercises(modules);
checkTranslations(modules);
checkBuildInputs(modules);
checkEncoding();

// ------------------------------------------------------------------- report

const group = (list) => {
  const by = new Map();
  for (const item of list) {
    if (!by.has(item.check)) by.set(item.check, []);
    by.get(item.check).push(item.msg);
  }
  return by;
};

if (VERBOSE || (!errors.length && !warnings.length)) {
  for (const { check, msg } of passed) console.log(`  ok    [${check}] ${msg}`);
}

for (const [check, msgs] of group(warnings)) {
  console.log(`\n  warn  [${check}]`);
  for (const m of msgs) console.log(`        ${m}`);
}

for (const [check, msgs] of group(errors)) {
  console.log(`\n  FAIL  [${check}]`);
  for (const m of msgs) console.log(`        ${m}`);
}

console.log('');
if (errors.length) {
  console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);
  if (!WARN_ONLY) process.exit(1);
} else {
  console.log(`Content valid. ${warnings.length} warning(s).`);
}
