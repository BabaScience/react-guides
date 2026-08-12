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
  src/data/*.ts                  Module / step / exercise metadata
  src/i18n/locales/*.json        UI strings + module, step and exercise text
  src/sandbox/                   Transpiler, test harness, test runner, extractors
  src/components/                Lesson, exercise, module, layout and UI components
  scripts/copy-content.js        Copies content into public/raw/ for production

scripts/
  validate-content.mjs           Content validator — run this before you commit
```

### How a page is assembled

1. `platform/src/data/*.ts` declares each module's ordered list of **steps**.
2. A lesson step names an English `## ` heading (`sectionHeading`).
3. `loadGuide()` fetches the chapter in the reader's language *and* in English.
4. The heading's **ordinal** is found in the English chapter and the same
   position is taken from the localized one — so translated headings never
   break the lookup.
5. An exercise step names an entry in `module.exercises`, which maps to an
   `// EXERCISE N:` block in `src/<module>/index.tsx` and a
   `describe("Exercise N …")` block in `index.test.tsx`.

Every one of those joins is checked by the validator.

---

## Commands

From the repo root:

```bash
npm run validate
```

Checks that chapters, module metadata and the three locale files still agree —
section headings resolve exactly, no chapter section is unreachable, every
exercise has a banner + export + test block, every id has translations, and
every exercise directory is in the production copy list. **CI runs this on every
push; run it locally before committing content changes.**

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
3. Add a `{ type: 'lesson', id, title, sectionHeading }` entry to the module's
   step list in `platform/src/data/`. `sectionHeading` must equal the English
   heading exactly, leading number included.
4. Add `steps.<module>.<id>` to all three locale files.
5. `npm run validate`.

### A new exercise

1. Add an `// EXERCISE N: Title` block to `src/<module>/index.tsx` with an
   exported symbol.
2. Add a `describe('Exercise N: …')` block to `src/<module>/index.test.tsx`.
3. Add the exercise to `module.exercises` **and** to the step timeline.
4. Add `exercises.<module>.<id>` (`name`, `description`, `hints`) to all three
   locale files — hint text lives only there, never in the data files.
5. `npm run validate`.

### A new module

Also add its `exerciseDir` to `platform/scripts/copy-content.js`, or the files
will 404 in production only. The validator catches this.

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
