# Learning Platform

An interactive, multi-track learning platform: long-form illustrated guides plus
test-driven exercises you solve in the browser, in English, French and Italian.

| | |
|---|---|
| **Tracks** | JavaScript · React · React Native |
| **Chapters** | 55 (≈254k words in English, ≈634k including translations) |
| **Diagrams** | 611 Mermaid diagrams |
| **Steps** | 384 (317 lessons, 67 exercises) |
| **Languages** | 🇬🇧 English · 🇫🇷 French · 🇮🇹 Italian |

---

## Quick start

```bash
cd platform && npm install && npm run dev
```

Then open http://localhost:3000.

Everything runs in the browser — the editor (Monaco), the TypeScript/JSX
transpiler (Babel standalone) and the test runner are all bundled. There is no
backend and no account; progress is saved to `localStorage`.

---

## Repository layout

```
content/
  modules/
    01-fundamentals.yml          One file per module: order, steps, exercises
    js-01-prerequisites.yml      …57 of them. This is the source of truth.

arguments/
  00-roadmap.md                  Track overview
  chapters/
    01-fundamentals.md …         React chapters      (English)
    js-01-prerequisites.md …     JavaScript chapters (English)
    rn-01-prerequisites.md …     React Native chapters (English)
    fr/  it/                     Translations, same filenames

src/
  01-fundamentals/               One directory per module with exercises
    index.tsx                    Learner-facing stubs, split by `// EXERCISE N:` banners
    index.test.tsx               The contract each stub must satisfy
    README.md                    Optional per-module notes

platform/                        The Vite + React app that serves all of the above
  src/data/manifest.json         GENERATED — do not edit; run `npm run manifest`
  src/i18n/locales/*.json        UI strings + module, step and exercise text
  src/sandbox/                   Transpiler, test harness, test runner, extractors
  src/components/                Lesson, exercise, module, layout and UI components
  scripts/copy-content.js        Copies content into public/raw/ for production

scripts/
  build-manifest.mjs             content/modules/*.yml → manifest.json
  validate-content.mjs           Content validator — run this before you commit
```

### How a page is assembled

1. `content/modules/<id>.yml` declares the module's ordered list of **steps**.
2. A lesson step names an English `## ` heading; an exercise step names an entry
   under `exercises:`.
3. `scripts/build-manifest.mjs` compiles those files into `manifest.json`, and
   **refuses to compile** unless every heading in the guide is either claimed by
   a lesson step or listed under `skipSections`.
4. At runtime `loadGuide()` fetches the chapter in the reader's language *and* in
   English. The heading's **ordinal** is found in the English chapter and the
   same position is taken from the localized one — so translated headings never
   break the lookup.
5. An exercise step maps to an `// EXERCISE N:` block in
   `src/<module>/index.tsx` and a `describe("Exercise N …")` block in
   `index.test.tsx`.

Step 3 is the important one: a written-but-unreachable section can't exist, and
a typo'd heading fails the build rather than showing a learner an error page.
Everything the compiler can't see — translated chapters, exercise files, locale
keys — is checked by the validator.

---

## Commands

From the repo root:

```bash
npm run manifest && npm run validate
```

`manifest` compiles `content/modules/*.yml` into the catalogue the app imports.
`validate` then checks everything the compiler can't see: translated chapters
keep the same headings, every exercise has a banner + export + test block, every
id has translations in all three locales, and the committed manifest is current.
**CI runs both on every push; run them locally before committing content
changes.**

From `platform/`:

```bash
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Copy content → typecheck → production build |
| `npm run preview` | Serve the production build on :4173 |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Adding content

### A new lesson

1. Add a `## N. Your Heading` section to the chapter in `arguments/chapters/`.
2. Add the matching section to `fr/` and `it/` — **same count, same order**;
   the ordinal lookup depends on it.
3. Add `- lesson: your-step-id` / `section: N. Your Heading` to the module's
   `steps:` in `content/modules/<id>.yml`, in the position you want it read.
   The section text must equal the English heading exactly, leading number
   included.
4. Add `steps.<module>.<id>` to all three locale files.
5. `npm run manifest && npm run validate`.

Skip step 3 and the build fails with the heading you forgot — that is the point.

### A new exercise

1. Add an `// EXERCISE N: Title` block to `src/<module>/index.tsx` with an
   exported symbol.
2. Add a `describe('Exercise N: …')` block to `src/<module>/index.test.tsx`.
3. In `content/modules/<id>.yml`, add the exercise under `exercises:` (with its
   `number` and `componentName`) **and** a `- exercise: <id>` entry in `steps:`.
4. Add `exercises.<module>.<id>` (`name`, `description`, `hints`) to all three
   locale files — hint text lives only there.
5. `npm run manifest && npm run validate`.

### A new module

Add `content/modules/<id>.yml` and the chapter it points at. Nothing else needs
touching: `copy-content.js` reads its source list from the manifest, so a new
module is picked up by the production build automatically.

### A new track

1. Add the chapters under `arguments/chapters/`.
2. Add `content/modules/<id>.yml` for each module, with `track:` set.
3. Add the track to `Track` in `platform/src/types/exercise.ts`, plus its label
   in `Sidebar.tsx` and `ProgressDashboard.tsx`.
4. If its exercises can't be graded by running JavaScript in this page, set
   `runner:` on the modules and implement it — see below.

### Exercise runners

How a module's exercises are graded is pluggable. A module may name one:

```yaml
runner: python-pyodide
```

Omitted, it takes the track's default (`react-browser` for the three
JavaScript-family tracks). Implementations live in
`platform/src/sandbox/runners/` and satisfy one interface:

```ts
interface ExerciseRunner {
  id: RunnerId;
  run(request: ExerciseRunRequest): Promise<TestRunResult>;
}
```

| Runner | Status | Needs |
| --- | --- | --- |
| `react-browser` | working | nothing — runs in this page |
| `node-webcontainer` | planned | a Node runtime in the browser (WebContainers) |
| `python-pyodide` | planned | CPython compiled to WebAssembly |
| `map-interactive` | planned | an interactive map component |
| `quiz` | planned | the quiz format from Phase 3 |

Planned runners report themselves to the learner rather than throwing, so a
track can ship its **lessons** before its grader exists.

### Ids are progress keys

`lessonSteps["01-fundamentals/jsx-syntax"]` is how a learner's completed lessons
are stored. Renaming a step or exercise id silently discards their progress for
it — treat ids as permanent, and change display text in the locale files instead.

---

## Project documents

- [ANALYSIS.md](ANALYSIS.md) — architecture audit: what works, what's broken,
  what blocks scaling to more tracks.
- [PLAN.md](PLAN.md) — the remediation plan, phase by phase.
- [platform/DESIGN_SYSTEM.md](platform/DESIGN_SYSTEM.md) — "Paper & ink" design
  system. Read before touching UI.
- [TRANSLATION-TODO.md](TRANSLATION-TODO.md) — translation coverage.
- [EXERCISE-VALIDATION.md](EXERCISE-VALIDATION.md) — per-exercise hint and
  reference-solution review.

---

## Known gaps

- The **JavaScript track has no French or Italian chapters** yet; those lessons
  fall back to English.
- The JavaScript and React Native tracks have few or no exercises (0 and 4).
- No quizzes, projects or capstones yet — see PLAN.md Phase 3.
- Exercise execution is React-in-the-browser only; Node, Python and GIS tracks
  need the pluggable runner in PLAN.md P2.6.
