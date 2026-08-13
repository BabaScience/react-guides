#!/usr/bin/env node
/**
 * Compiles `content/modules/*.yml` into `platform/src/data/manifest.json`.
 *
 * This is the join that used to be maintained by hand in three places at once
 * (module metadata in TypeScript, headings in markdown, keys in the locale
 * files) and drifted in eight measurable ways. Two invariants are enforced here,
 * so a broken join fails the build instead of rendering an error to a learner:
 *
 *   1. Every `## ` heading in a module's guide is either claimed by a lesson
 *      step or listed under `skipSections` — an unreachable section cannot exist.
 *   2. Every lesson step points at a heading that is actually in the guide, and
 *      no two steps point at the same one.
 *
 * Step and exercise ids are declared, never derived from heading text. They are
 * progress keys, so re-slugging them would wipe learners' completed lessons.
 *
 * Usage:
 *   node scripts/build-manifest.mjs           write the manifest
 *   node scripts/build-manifest.mjs --check   verify it is up to date (CI)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
const PLATFORM = path.join(ROOT, 'platform');
const MODULES_DIR = path.join(ROOT, 'content', 'modules');
const MANIFEST_PATH = path.join(PLATFORM, 'src', 'data', 'manifest.json');

const require = createRequire(path.join(PLATFORM, 'package.json'));
const YAML = require('yaml');

const TRACKS = ['react', 'react-native', 'javascript'];
const STATUSES = ['available', 'coming-soon'];
/**
 * Keep in step with `RunnerId` in platform/src/sandbox/runner-types.ts. A module
 * may name one explicitly; omitting it means "the default for the track".
 */
const RUNNERS = [
  'react-browser',
  'node-webcontainer',
  'python-pyodide',
  'map-interactive',
  'quiz',
];

/** H2 headings of a markdown file, in document order. */
export function guideHeadings(absPath) {
  return fs
    .readFileSync(absPath, 'utf8')
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace(/^## /, '').trim());
}

/**
 * Read every module file and compile it, collecting errors rather than throwing
 * on the first one — a contributor should see everything wrong in one run.
 */
export function buildManifest() {
  const errors = [];
  const fail = (file, msg) => errors.push(`${file}: ${msg}`);

  if (!fs.existsSync(MODULES_DIR)) {
    return { modules: [], errors: [`${path.relative(ROOT, MODULES_DIR)} does not exist`] };
  }

  const files = fs.readdirSync(MODULES_DIR).filter((f) => f.endsWith('.yml')).sort();
  const modules = [];

  for (const file of files) {
    let doc;
    try {
      doc = YAML.parse(fs.readFileSync(path.join(MODULES_DIR, file), 'utf8'));
    } catch (e) {
      fail(file, `invalid YAML — ${e.message}`);
      continue;
    }
    if (!doc || typeof doc !== 'object') {
      fail(file, 'empty or not a mapping');
      continue;
    }

    // --- required scalars
    const expectedId = file.replace(/\.yml$/, '');
    if (doc.id !== expectedId) fail(file, `id "${doc.id}" does not match the filename`);
    if (!TRACKS.includes(doc.track)) fail(file, `track "${doc.track}" is not one of ${TRACKS.join(', ')}`);
    if (!Number.isInteger(doc.number)) fail(file, 'number must be an integer');
    if (!STATUSES.includes(doc.status)) fail(file, `status "${doc.status}" is not one of ${STATUSES.join(', ')}`);
    if (doc.runner !== undefined && !RUNNERS.includes(doc.runner))
      fail(file, `runner "${doc.runner}" is not one of ${RUNNERS.join(', ')}`);

    const steps = doc.steps ?? [];
    const exercises = doc.exercises ?? {};
    const skipSections = doc.skipSections ?? [];

    // --- the guide, and the two invariants that make orphans impossible
    let available = [];
    if (doc.guide) {
      const abs = path.join(ROOT, doc.guide);
      if (!fs.existsSync(abs)) {
        fail(file, `guide not found on disk — ${doc.guide}`);
      } else {
        available = guideHeadings(abs);
      }
    } else if (doc.status === 'available') {
      fail(file, 'status is "available" but no guide is set');
    }

    const claimed = new Map(); // heading -> step id
    const compiledSteps = [];

    for (const [i, step] of steps.entries()) {
      const where = `steps[${i}]`;
      const isLesson = typeof step.lesson === 'string';
      const isExercise = typeof step.exercise === 'string';

      if (isLesson === isExercise) {
        fail(file, `${where} must have exactly one of "lesson" or "exercise"`);
        continue;
      }

      if (isExercise) {
        if (!exercises[step.exercise]) {
          fail(file, `${where} references exercise "${step.exercise}", which has no entry under exercises:`);
          continue;
        }
        compiledSteps.push({ type: 'exercise', id: step.exercise });
        continue;
      }

      if (typeof step.section !== 'string') {
        fail(file, `${where} (lesson "${step.lesson}") is missing "section"`);
        continue;
      }
      if (!available.includes(step.section)) {
        const near = available.find(
          (h) => h.toLowerCase().includes(step.section.toLowerCase()) ||
                 step.section.toLowerCase().includes(h.toLowerCase())
        );
        fail(
          file,
          `${where} points at "${step.section}", which is not a heading in the guide` +
            (near ? ` — did you mean "${near}"?` : '')
        );
        continue;
      }
      if (claimed.has(step.section)) {
        fail(file, `"${step.section}" is claimed by both "${claimed.get(step.section)}" and "${step.lesson}"`);
        continue;
      }
      claimed.set(step.section, step.lesson);
      compiledSteps.push({ type: 'lesson', id: step.lesson, sectionHeading: step.section });
    }

    // Invariant 1 — nothing written is unreachable.
    if (steps.length > 0) {
      const orphans = available.filter((h) => !claimed.has(h) && !skipSections.includes(h));
      if (orphans.length) {
        fail(
          file,
          `${orphans.length} guide section(s) are neither a step nor skipped — ` +
            orphans.map((h) => `"${h}"`).join(', ')
        );
      }
      const staleSkips = skipSections.filter((h) => !available.includes(h));
      if (staleSkips.length) {
        fail(file, `skipSections lists heading(s) not in the guide — ${staleSkips.join(', ')}`);
      }
    }

    // --- exercises must all be reachable from the timeline
    const stepExerciseIds = compiledSteps.filter((s) => s.type === 'exercise').map((s) => s.id);
    for (const id of Object.keys(exercises)) {
      if (!stepExerciseIds.includes(id)) {
        fail(file, `exercise "${id}" is defined but never appears in steps — unreachable`);
      }
      const ex = exercises[id];
      if (!Number.isInteger(ex?.number)) fail(file, `exercise "${id}" needs an integer number`);
      if (typeof ex?.componentName !== 'string') fail(file, `exercise "${id}" needs a componentName`);
    }

    modules.push({
      id: doc.id,
      number: doc.number,
      track: doc.track,
      status: doc.status,
      ...(doc.runner ? { runner: doc.runner } : {}),
      guideFile: doc.guide ?? '',
      exerciseDir: doc.exerciseDir ?? '',
      steps: compiledSteps,
      exercises: Object.entries(exercises)
        .map(([id, ex]) => ({ id, number: ex.number, componentName: ex.componentName }))
        .sort((a, b) => a.number - b.number),
    });
  }

  // --- cross-module identity
  const seenTrackNumber = new Set();
  for (const m of modules) {
    const key = `${m.track}#${m.number}`;
    if (seenTrackNumber.has(key)) errors.push(`duplicate (track, number): ${m.track} #${m.number} (${m.id})`);
    seenTrackNumber.add(key);
  }

  // Track order, then module number — the order the sidebar renders.
  modules.sort((a, b) =>
    a.track === b.track ? a.number - b.number : TRACKS.indexOf(a.track) - TRACKS.indexOf(b.track)
  );

  return { modules, errors };
}

function serialise(modules) {
  return (
    JSON.stringify(
      {
        // Generated — see scripts/build-manifest.mjs. Edit content/modules/*.yml.
        generator: 'scripts/build-manifest.mjs',
        modules,
      },
      null,
      2
    ) + '\n'
  );
}

// --- CLI -------------------------------------------------------------------

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const check = process.argv.includes('--check');
  const { modules, errors } = buildManifest();

  if (errors.length) {
    console.error(`\n  FAIL  content/modules\n`);
    for (const e of errors) console.error(`        ${e}`);
    console.error(`\n${errors.length} error(s).\n`);
    process.exit(1);
  }

  const next = serialise(modules);
  const current = fs.existsSync(MANIFEST_PATH) ? fs.readFileSync(MANIFEST_PATH, 'utf8') : null;

  if (check) {
    if (current !== next) {
      console.error(
        '\nmanifest.json is out of date. Run `npm run manifest` and commit the result.\n'
      );
      process.exit(1);
    }
    console.log(`Manifest up to date — ${modules.length} modules.`);
  } else {
    fs.writeFileSync(MANIFEST_PATH, next, 'utf8');
    const steps = modules.reduce((n, m) => n + m.steps.length, 0);
    const exercises = modules.reduce((n, m) => n + m.exercises.length, 0);
    console.log(
      `Wrote platform/src/data/manifest.json — ${modules.length} modules, ${steps} steps, ${exercises} exercises.`
    );
  }
}
