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
const QUIZZES_DIR = path.join(ROOT, 'content', 'quizzes');
const MANIFEST_PATH = path.join(PLATFORM, 'src', 'data', 'manifest.json');

/** Locales a quiz may supply. `en` is required; the rest fall back to it. */
const QUIZ_LOCALES = ['en', 'fr', 'it'];

const require = createRequire(path.join(PLATFORM, 'package.json'));
const YAML = require('yaml');

const TRACKS = ['react', 'react-native', 'javascript'];
const STATUSES = ['available', 'coming-soon'];
/** Ordered easiest first; the UI relies on the order for its badge colours. */
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
/**
 * Keep in step with `RunnerId` in platform/src/sandbox/runner-types.ts. A module
 * may name one explicitly; omitting it means "the default for the track".
 */
const RUNNERS = [
  'react-browser',
  'node-webcontainer',
  'python-pyodide',
  'map-interactive',
];

/** H2 headings of a markdown file, in document order. */
export function guideHeadings(absPath) {
  return fs
    .readFileSync(absPath, 'utf8')
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace(/^## /, '').trim());
}

/** Reading speed for technical prose, in words per minute. */
const WORDS_PER_MINUTE = 150;
/**
 * Code is read line by line, not at prose speed. Minutes per line.
 *
 * Blended on purpose: dense example lines take longer than this, and imports,
 * closing braces and JSX wrappers take far less. At 6s/line module 02 came out
 * at 5.5 hours, of which 3.3 was code — an intimidating number that says more
 * about how much of the chapter is fenced than about how long it takes.
 */
const MINUTES_PER_CODE_LINE = 0.05;
/** Roughly what an exercise and a checkpoint cost a learner. */
const MINUTES_PER_EXERCISE = 12;
const MINUTES_PER_QUIZ = 8;

/**
 * Per-section reading cost of a guide, as `heading -> minutes`.
 *
 * Derived rather than declared, deliberately. Fifty-seven hand-written
 * estimates would be guesses on day one and wrong the first time a chapter is
 * edited; this is recomputed from the text on every build. A module can still
 * override the total with `estimatedMinutes:` when the number is plainly wrong.
 *
 * Prose and code are counted separately because they are not read at the same
 * speed — a 40-line example is not 300 words of narrative.
 */
export function guideSectionMinutes(absPath) {
  const lines = fs.readFileSync(absPath, 'utf8').split('\n');
  const minutes = new Map();

  let heading = null;
  let prose = 0;
  let code = 0;
  let inFence = false;

  const flush = () => {
    if (heading === null) return;
    minutes.set(heading, prose / WORDS_PER_MINUTE + code * MINUTES_PER_CODE_LINE);
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flush();
      heading = line.replace(/^## /, '').trim();
      prose = 0;
      code = 0;
      inFence = false;
      continue;
    }
    if (heading === null) continue;
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) code++;
    else prose += (line.match(/\S+/g) ?? []).length;
  }
  flush();

  return minutes;
}

/** Round to the nearest 5 minutes; never claim an available module takes 0. */
function roundMinutes(raw) {
  return Math.max(5, Math.round(raw / 5) * 5);
}

/**
 * Compile a module's checkpoint quiz, if it has one.
 *
 * Quiz text is inline and multi-locale: a question, its options and its
 * explanation are one unit, and splitting them across the locale JSONs by key
 * path is the drift pattern this project has been removing. `en` is required;
 * other locales fall back to it, exactly like an untranslated chapter.
 */
function compileQuiz(moduleId, fail) {
  const file = path.join(QUIZZES_DIR, `${moduleId}.yml`);
  if (!fs.existsSync(file)) return null;
  const rel = `quizzes/${moduleId}.yml`;

  let doc;
  try {
    doc = YAML.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail(rel, `invalid YAML — ${e.message}`);
    return null;
  }
  if (!doc || !Array.isArray(doc.questions) || doc.questions.length === 0) {
    fail(rel, 'needs a non-empty `questions:` list');
    return null;
  }
  if (doc.module !== moduleId) fail(rel, `module: "${doc.module}" does not match the filename`);

  /** Normalise a localized string to `{ en, fr?, it? }`, requiring English. */
  const text = (value, where) => {
    if (typeof value === 'string') return { en: value };
    if (!value || typeof value !== 'object' || typeof value.en !== 'string') {
      fail(rel, `${where} needs at least an \`en:\` string`);
      return { en: '' };
    }
    const out = {};
    for (const locale of QUIZ_LOCALES) {
      if (typeof value[locale] === 'string') out[locale] = value[locale];
    }
    return out;
  };

  const seen = new Set();
  const questions = doc.questions.map((q, i) => {
    const where = `questions[${i}]`;
    if (typeof q?.id !== 'string') fail(rel, `${where} needs an id`);
    else if (seen.has(q.id)) fail(rel, `duplicate question id "${q.id}"`);
    else seen.add(q.id);

    const options = Array.isArray(q?.options) ? q.options : [];
    if (options.length < 2) fail(rel, `${where} ("${q?.id}") needs at least two options`);
    const correct = options.filter((o) => o?.correct === true);
    if (correct.length === 0)
      fail(rel, `${where} ("${q?.id}") has no option marked \`correct: true\``);
    if (correct.length === options.length)
      fail(rel, `${where} ("${q?.id}") marks every option correct`);

    const optionIds = new Set();
    for (const [j, o] of options.entries()) {
      if (typeof o?.id !== 'string') fail(rel, `${where}.options[${j}] needs an id`);
      else if (optionIds.has(o.id)) fail(rel, `${where} has duplicate option id "${o.id}"`);
      else optionIds.add(o.id);
    }

    return {
      id: q?.id ?? `question-${i}`,
      prompt: text(q?.prompt, `${where}.prompt`),
      // More than one correct answer means multi-select; the view reads this
      // rather than making authors declare a type that can contradict itself.
      multiple: correct.length > 1,
      options: options.map((o, j) => ({
        id: o?.id ?? `option-${j}`,
        correct: o?.correct === true,
        text: text(o?.text, `${where}.options[${j}].text`),
      })),
      explanation: q?.explanation ? text(q.explanation, `${where}.explanation`) : null,
    };
  });

  return { questions };
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

    // Reference solutions are optional: a module ships them or it doesn't, and
    // the app needs to know which without asking the network.
    const hasSolutions =
      !!doc.exerciseDir && fs.existsSync(path.join(ROOT, doc.exerciseDir, 'solution.tsx'));

    // --- the guide, and the two invariants that make orphans impossible
    let available = [];
    let sectionMinutes = new Map();
    if (doc.guide) {
      const abs = path.join(ROOT, doc.guide);
      if (!fs.existsSync(abs)) {
        fail(file, `guide not found on disk — ${doc.guide}`);
      } else {
        available = guideHeadings(abs);
        sectionMinutes = guideSectionMinutes(abs);
      }
    } else if (doc.status === 'available') {
      fail(file, 'status is "available" but no guide is set');
    }

    // --- difficulty and prerequisites (§6 of ANALYSIS: "Module 06 assumes
    // hooks; nothing says so"). Editorial judgements, so they are declared.
    if (doc.difficulty !== undefined && !DIFFICULTIES.includes(doc.difficulty))
      fail(file, `difficulty "${doc.difficulty}" is not one of ${DIFFICULTIES.join(', ')}`);
    if (doc.status === 'available' && doc.difficulty === undefined)
      fail(file, 'an available module needs a difficulty');

    const prerequisites = doc.prerequisites ?? [];
    if (!Array.isArray(prerequisites)) fail(file, 'prerequisites must be a list of module ids');
    if (prerequisites.includes(doc.id)) fail(file, 'a module cannot be its own prerequisite');

    if (doc.estimatedMinutes !== undefined && !(Number.isInteger(doc.estimatedMinutes) && doc.estimatedMinutes > 0))
      fail(file, 'estimatedMinutes must be a positive whole number of minutes');

    const claimed = new Map(); // heading -> step id
    const compiledSteps = [];

    const quiz = compileQuiz(doc.id, fail);

    for (const [i, step] of steps.entries()) {
      const where = `steps[${i}]`;
      const isLesson = typeof step.lesson === 'string';
      const isExercise = typeof step.exercise === 'string';
      const isQuiz = typeof step.quiz === 'string';

      if ([isLesson, isExercise, isQuiz].filter(Boolean).length !== 1) {
        fail(file, `${where} must have exactly one of "lesson", "exercise" or "quiz"`);
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

      if (isQuiz) {
        if (!quiz) {
          fail(file, `${where} adds a quiz step but content/quizzes/${doc.id}.yml does not exist`);
          continue;
        }
        compiledSteps.push({ type: 'quiz', id: step.quiz });
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

    // A quiz nobody can reach is the same failure as an unreachable section.
    if (quiz && !compiledSteps.some((s) => s.type === 'quiz')) {
      fail(
        file,
        `content/quizzes/${doc.id}.yml exists but no step references it — add a "- quiz: <id>" entry`
      );
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

    // Only the sections a step actually points at count — unreachable prose
    // costs the learner nothing, and `skipSections` is there precisely to say
    // "this is not part of the path".
    const lessonMinutes = [...claimed.keys()].reduce(
      (sum, heading) => sum + (sectionMinutes.get(heading) ?? 0),
      0
    );
    const estimatedMinutes =
      doc.estimatedMinutes ??
      (doc.status === 'available'
        ? roundMinutes(
            lessonMinutes +
              compiledSteps.filter((s) => s.type === 'exercise').length * MINUTES_PER_EXERCISE +
              compiledSteps.filter((s) => s.type === 'quiz').length * MINUTES_PER_QUIZ
          )
        : 0);

    modules.push({
      id: doc.id,
      number: doc.number,
      track: doc.track,
      status: doc.status,
      ...(doc.difficulty ? { difficulty: doc.difficulty } : {}),
      ...(estimatedMinutes ? { estimatedMinutes } : {}),
      ...(prerequisites.length ? { prerequisites } : {}),
      ...(doc.runner ? { runner: doc.runner } : {}),
      guideFile: doc.guide ?? '',
      exerciseDir: doc.exerciseDir ?? '',
      // Whether `<exerciseDir>/solution.tsx` exists, decided here rather than by
      // the app probing for the file at runtime. A dev server answers an unknown
      // path with index.html and a 200, so "did the fetch succeed" is not a
      // usable existence test — that is exactly bug §4.2(b).
      ...(hasSolutions ? { hasSolutions: true } : {}),
      ...(quiz ? { quiz } : {}),
      steps: compiledSteps,
      exercises: Object.entries(exercises)
        .map(([id, ex]) => ({ id, number: ex.number, componentName: ex.componentName }))
        .sort((a, b) => a.number - b.number),
    });
  }

  // --- the prerequisite graph must resolve, and must be a graph, not a knot.
  // A dangling id would render as a dead link; a cycle would tell a learner to
  // finish A before B and B before A, and would hang any future "what can I
  // start now" traversal.
  const byId = new Map(modules.map((m) => [m.id, m]));
  for (const m of modules) {
    for (const p of m.prerequisites ?? []) {
      if (!byId.has(p)) errors.push(`${m.id}: prerequisite "${p}" is not a module id`);
    }
  }

  const WHITE = 0, GREY = 1, BLACK = 2;
  const mark = new Map(modules.map((m) => [m.id, WHITE]));
  const reported = new Set();
  const visit = (id, trail) => {
    if (mark.get(id) === BLACK) return;
    if (mark.get(id) === GREY) {
      const cycle = [...trail.slice(trail.indexOf(id)), id].join(' → ');
      if (!reported.has(cycle)) {
        reported.add(cycle);
        errors.push(`prerequisite cycle: ${cycle}`);
      }
      return;
    }
    mark.set(id, GREY);
    for (const p of byId.get(id)?.prerequisites ?? []) {
      if (byId.has(p)) visit(p, [...trail, id]);
    }
    mark.set(id, BLACK);
  };
  for (const m of modules) visit(m.id, []);

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
