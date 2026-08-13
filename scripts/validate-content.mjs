#!/usr/bin/env node
/**
 * Content validator.
 *
 * The platform joins three sources of truth:
 *
 *   1. markdown chapters       arguments/chapters/**.md
 *   2. module metadata         content/modules/*.yml
 *   3. UI translations         platform/src/i18n/locales/*.json
 *
 * `scripts/build-manifest.mjs` owns the (1)↔(2) join — it refuses to compile a
 * module whose steps and guide headings don't correspond exactly. This script
 * runs that compiler first, then checks everything the compiler cannot see: the
 * translated chapters, the exercise files on disk, the locale keys, and what the
 * production build actually copies.
 *
 * Usage:
 *   node scripts/validate-content.mjs             # exit 1 on any error
 *   node scripts/validate-content.mjs --warn-only # always exit 0
 *   node scripts/validate-content.mjs --verbose   # also print passing checks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildManifest } from './build-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PLATFORM = path.join(ROOT, 'platform');

const WARN_ONLY = process.argv.includes('--warn-only');
const VERBOSE = process.argv.includes('--verbose');

const LOCALES = ['en', 'fr', 'it'];

// ---------------------------------------------------------------- diagnostics

const errors = [];
const warnings = [];
const passed = [];

const err = (check, msg) => errors.push({ check, msg });
const warn = (check, msg) => warnings.push({ check, msg });
const ok = (check, msg) => passed.push({ check, msg });

// ------------------------------------------------------------------- loading

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

/**
 * copy-content.js now derives its source list from the manifest, so the old
 * "did someone forget to add the directory" check is obsolete by construction.
 * What still needs asserting is that the manifest the app imports matches the
 * module files on disk — otherwise the build ships a stale catalogue.
 */
function checkBuildInputs(modules) {
  const manifestPath = path.join(PLATFORM, 'src/data/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    err('build', 'platform/src/data/manifest.json is missing — run `npm run manifest`');
    return;
  }

  const committed = readJson(manifestPath).modules;
  if (JSON.stringify(committed) !== JSON.stringify(modules)) {
    err(
      'build',
      'manifest.json is out of date with content/modules/*.yml — run `npm run manifest` and commit the result'
    );
    return;
  }

  const dirs = [...new Set(modules.filter((m) => m.exercises.length).map((m) => m.exerciseDir))];
  ok('build', `manifest is current; ${dirs.length} exercise directories will be copied`);
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

// The manifest compiler owns the module-file ↔ guide-heading join, including
// the "nothing written is unreachable" invariant. If it can't compile, none of
// the checks below would mean anything.
const { modules, errors: manifestErrors } = buildManifest();
for (const message of manifestErrors) err('modules', message);
if (!manifestErrors.length) {
  ok('modules', `${modules.length} module files compile; every guide section is claimed or skipped`);
}

checkHeadingParity(modules);
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
