# Project Analysis — Pre-Scaling Audit

> **Status:** this is the audit as taken. Phase 0 and Phase 1 of
> [PLAN.md](PLAN.md) have since been implemented — §4.1, §4.2, §4.3, §4.4,
> §4.7, §4.8, §4.9, §5.1 and the missing guard rails in §5.4 are fixed and
> verified. The findings below are kept as written so the reasoning stays
> readable; PLAN.md is the live checklist.

**Date:** 2026-08-10
**Scope:** whole repo (`arguments/`, `src/`, `platform/`, docs, build, deploy)
**Goal:** find what is broken, inconsistent, or structurally blocking *before* adding
GIS, Node.js, Python and other tracks.

Everything below was verified by running the code — build, typecheck, a scripted
cross-consistency audit, and live browser checks — not by reading alone. Where a claim
is a judgement call rather than a measurement, it says so.

---

## 1. Executive summary

The content is genuinely strong: ~460k words across 3 tracks, 611 mermaid diagrams, 2,857
code blocks, full FR/IT parity on 31 of 55 chapters. The platform that serves it is a
well-built prototype that has quietly outgrown its own architecture.

Five things matter most, in this order:

1. **~25% of the React track is written but unreachable.** 39 authored sections
   (~17,600 words) — React Query, SWR, Zod, React Hook Form, code splitting, Playwright,
   Cypress, nested routes, Jotai/Recoil, every decision matrix, every conclusion — have no
   entry in the step timeline, so no learner can ever open them. §4.1
2. **Module 04 is broken in French and Italian**, and the entire JavaScript track is broken
   in FR/IT during local development. Learners hit a red error screen instead of a lesson. §4.2
3. **The code editor is loaded from a public CDN at runtime.** No editor = no exercises.
   Any network that blocks jsdelivr breaks the core product. §5.1
4. **The content model is TypeScript source code**, hand-maintained in parallel with markdown
   files and three JSON locale files, with nothing checking that they agree. They already
   disagree in 8 measurable ways. Adding 4 more tracks multiplies this by 4. §7
5. **There are no projects, no quizzes, no checkpoints, and no capstones** anywhere in
   460k words. This is the pedagogical gap you already suspected. §6

There is no CI, no linter, no test suite for the platform, and no validation script. Every
one of the inconsistencies below would have been caught automatically by ~150 lines of
validator (§9.1).

---

## 2. What actually exists today

Measured, not estimated.

### Content

| Track | Chapters | Words (EN) | Mermaid | Code blocks | FR | IT |
|---|---|---|---|---|---|---|
| React | 10 | 69,995 | 76 | 502 | full parity | full parity |
| React Native | 21 | 107,958 | 165 | 562 | full parity | full parity |
| JavaScript | 24 | 75,788 | 129 | 729 | **none** | **none** |
| **Total** | **55** | **253,741** | **370** | **1,793** | 31/55 | 31/55 |

Including translations: 117 markdown files, ~634k words, 611 diagrams, 2,857 code blocks.
**Zero images.** Every visual in the project is a mermaid diagram.

### Platform

- 57 modules (12 React, 21 RN, 24 JS), 55 available, 2 coming-soon
- 345 steps (278 lessons, 67 exercises)
- **11 of 57 modules have exercises** — the RN track has exercises in exactly one module
  (`rn-04`), the JS track has none at all
- 3,834 lines of TS/TSX + 4,425 lines of locale JSON
- 0 tests, 0 lint config, 0 CI

### Stack

Vite 5 · React 18 · TypeScript 5 (strict) · Tailwind 3 · Zustand 4 (localStorage) ·
react-router 6 · react-markdown + remark-gfm + rehype-raw · Shiki 4 · Mermaid 10 ·
Monaco (via `@monaco-editor/react`) · `@babel/standalone` (in-browser transpile) ·
react-native-web · i18next · Vercel static hosting

---

## 3. How it fits together

```
arguments/chapters/*.md ──┐
                          ├─► /raw/ endpoint ──► loader.ts ──► section-extractor ──► MarkdownRenderer
src/<module>/index.tsx ───┤     (vite middleware in dev,      (fuzzy H2 lookup)      (+ Shiki, Mermaid)
src/<module>/index.test ──┘      copied to public/raw/ in prod)
                                        │
platform/src/data/*.ts ─────────────────┼──► modules[] (id, guideFile, exerciseDir,
  (hand-written module/step/exercise    │            steps[], exercises[])
   metadata, 2,030 lines)               │
                                        ▼
i18n/locales/{en,fr,it}.json ──► t(`modules.${id}.name`, fallback) ──► UI
                                        │
                                        ▼
                    Monaco editor ──► @babel/standalone ──► (0,eval) ──► test-harness
                    (from jsdelivr)      (in browser)      (main window!)
```

**The load-bearing weakness:** three independent sources of truth — the markdown, the TS
metadata, and the locale JSON — joined by *string matching* (`sectionHeading` against H2
text, `EXERCISE N:` comment banners, `t()` key paths) with **fuzzy fallbacks that hide
failures instead of surfacing them**. Nothing validates the joins.

---

## 4. Confirmed bugs

Ranked by learner impact. All reproduced.

### 4.1 CRITICAL — 39 authored sections are unreachable (~17,600 words, ~25% of the React track)

A lesson is only visible if some `Step` in `platform/src/data/modules.ts` points at its H2.
39 sections have no such step:

| Module | Orphaned sections |
|---|---|
| 03 Component Patterns | State Elevation Strategies · Component Architecture & Organization · Advanced Composition · Pattern Selection Matrix · Conclusion |
| 04 Styling | Performance Considerations · Advanced Styling Patterns · Styling Strategy Matrix · Conclusion |
| 05 Routing | **Nested Routes and Layouts** · Route Guards & Redirects · Advanced Routing · Performance Optimization · Conclusion |
| 06 State Mgmt | **Middleware & Async Operations** · Jotai · Recoil · Selection Matrix · Conclusion |
| 07 Data Fetching | **React Query** · **SWR** · Strategy Selection · Conclusion |
| 08 Forms | **React Hook Form** · **Validation with Zod** · File Upload Handling · Strategy Matrix · Conclusion |
| 09 Performance | **Code Splitting & Lazy Loading** · Bundle Size Optimization · Performance Monitoring · Strategy Selection · Conclusion |
| 10 Testing | Integration Testing · **Cypress** · **Playwright** · Coverage & Quality Metrics |
| 01, 02 | Summary / Wrapping Up |

The bolded ones are the most-searched topics in the entire React ecosystem. They are
written, translated into French and Italian, and invisible.

*(Every chapter's `Table of Contents` section is also unreached — that one is correct, the
step timeline replaces it.)*

**Fix:** either add the missing steps, or invert the relationship — derive steps from the
markdown headings instead of hand-listing them (§8.2).

### 4.2 CRITICAL — lessons show an error screen in FR/IT

Two independent causes, same symptom: a red *"Section … introuvable dans le guide"* dead-end.

**(a) Module 04 — production and dev, French and Italian.**
`platform/src/data/modules.ts:43-57` is the only step list whose `sectionHeading` values omit
the leading number (`'Styling Paradigms in React'` instead of `'1. Styling Paradigms in
React'`). The translated chapters translate the H2 text but keep the numbers, so
`findSection`'s number fallback (`section-extractor.ts:78-84`) — the mechanism that rescues
every other module — cannot fire. **7 of 13 steps in module 04 are dead in both FR and IT.**

Verified live:

> `Étape 1/13 — Paradigmes de Style`
> `Section "Styling Paradigms in React" introuvable dans le guide`

**(b) The whole JS track — dev and `vite preview`, French and Italian.**
`loadGuideContent` (`platform/src/data/loader.ts:22-23`) tries the localized path and treats
`res.ok` as "the translation exists". Dev server and `vite preview` both SPA-fallback
unknown paths to `index.html` **with status 200**, so the check passes and the app parses an
HTML document as markdown — the English fallback never runs.

Measured:
```
GET /raw/arguments/chapters/fr/js-02-language-basics.md  ->  200, 577 bytes, "<!DOCTYPE html>"
```

Production happens to work only because `platform/vercel.json` excludes `/raw/` from its
rewrite. **The correctness of the entire fallback mechanism rests on one regex in one
hosting config.** Move the guard into the code: check `content-type`, or reject a body
starting with `<!DOCTYPE`.

### 4.3 HIGH — the TypeScript preprocessor corrupts valid learner code

`platform/src/sandbox/transpiler.ts:36-43` strips types with regexes before Babel runs.
`[^}]*` and `[^;]+` cannot handle nested braces or semicolons inside a type body. Actual
output for perfectly valid code:

```ts
// input
export interface Props { user: { name: string }; age: number; }
export type Pair = { a: string; b: number };

// after preprocessTypeScript()
;
  age: number;
}

 b: number };
```

Guaranteed syntax error, reported to the learner as *their* mistake. **Babel's TypeScript
preset already handles all four constructs correctly** — the preprocessor is legacy and
should simply be deleted.

### 4.4 HIGH — `afterEach` is a silent no-op

`platform/src/sandbox/sandbox-iframe.ts:168`: `afterEach: () => {}, // noop for compatibility`.
Any exercise or test that relies on `afterEach` cleanup silently doesn't run it. In a project
whose module 10 *teaches testing*, a fake `afterEach` is a bad thing to hand a learner.
`beforeAll`/`afterAll` don't exist at all.

### 4.5 MEDIUM — the file called `sandbox-iframe.ts` has no sandbox

Despite the name, `runTestsInSandbox` runs learner code with `(0, eval)` **in the main
window** (`sandbox-iframe.ts:212-229`), with full access to `document`, `localStorage`
(including all saved progress), and the app's origin. `LivePreview.tsx:96` does the same.

For self-written code this is acceptable. It stops being acceptable the moment you add
shareable solutions, imported starter code, or any content the learner didn't type. There is
also no timeout: `while(true)` in the editor freezes the tab permanently, with no recovery.

Real `<iframe sandbox="allow-scripts">` + `postMessage` + a watchdog timer fixes both. At
minimum, rename the file so it stops claiming a guarantee it doesn't provide.

### 4.6 MEDIUM — dev server serves the whole repo, including `.git`

`platform/vite.config.ts:70-92` mounts a `/raw` middleware that reads any path under the repo
root, bypassing Vite's own `fs.deny` (which normally blocks `.env` and `.git`). Confirmed:

```
GET http://localhost:3000/raw/.git/config  ->  200
[remote "origin"] url = ssh://git@gitlab.gruppodigitouch.it:2289/...
```

Only exploitable if the dev server is exposed (`--host`, or a shared machine), so it's a
hardening gap, not an active breach. Fix: allowlist `arguments/` and `src/<module>/` and
reject anything else.

### 4.7 MEDIUM — the dashboard's progress bar doesn't update

`platform/src/components/progress/ProgressDashboard.tsx:32-35` calls
`useProgressStore.getState()` inside a `reduce` during render. That's a non-reactive read —
the component never subscribes, so the global progress bar is stale until something else
forces a re-render.

### 4.8 MEDIUM — editing a preview prop re-transpiles and remounts the component

`LivePreview.tsx:140` lists `currentProps` in the effect's dependencies, so every prop tweak
re-runs Babel over the whole module and produces a *new* component identity — React unmounts
and remounts, and the preview loses its internal state. Typing in a preview prop resets the
counter you were watching. Split the effect: compile on `code`, render on `currentProps`.

### 4.9 LOW — grab bag

| Issue | Location | Effect |
|---|---|---|
| `favicon.svg` referenced but doesn't exist | `platform/index.html:7` | 404 on every page load |
| `<html lang="en">` never updates | `platform/index.html:2` | wrong language for screen readers/SEO in FR/IT |
| Persisted stores have no `version`/`migrate` | `progress-store.ts:199`, `ui-store.ts:45` | any schema change silently corrupts saved work |
| `saveCode` on every keystroke | `ExerciseStepView.tsx:106-110` | a localStorage write per character |
| Progress only recorded via the "Continue" button | `LessonStepView.tsx:98,108` | navigating by the timeline or the top-bar `Suiv →` doesn't mark the lesson done |
| No `errorElement`, no catch-all route | `routes.tsx` | unknown URLs and render errors show react-router's raw stack trace |
| Dead code | `CodeBlock.tsx`, `ExerciseChecklist.tsx`, `sandbox/types.ts` | unreferenced |
| Stale comments | `sandbox-iframe.ts:33-36` cites a `react-act-shim.ts` that doesn't exist; `LivePreview.tsx:26-34` says "sandboxed" and "rendered with no props" — both untrue | misleads the next maintainer |
| 116 of 117 chapters carry a UTF-8 BOM; 8 use CRLF | `arguments/chapters/` | harmless today only because every file starts with `#`; no `.gitattributes`/`.editorconfig` to stop the drift |

---

## 5. Technology assessment

The stack choices are sound. Three have outgrown their configuration.

### 5.1 Monaco loads from a public CDN — replace this first

Verified at runtime, in both dev and production builds:

```
https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/loader.js
… 12 more files from cdn.jsdelivr.net
```

`@monaco-editor/react` defaults to CDN delivery and nothing overrides it. Consequences:
no offline use, no air-gapped/corporate-firewall use, no subresource integrity, and a
third-party runtime dependency on the *only* component that makes exercises possible.

Fix (small): install `monaco-editor` as a direct dependency and
`loader.config({ monaco })` so Vite bundles it. Alternative if bundle size is the concern:
**CodeMirror 6** — roughly a tenth of Monaco's weight, first-class Vite support, good
TS/JSX support. Monaco's edge is its TypeScript language service (which you actively use for
`.d.ts`-backed autocomplete), so bundling Monaco is the lower-risk move.

### 5.2 Shiki bundles every grammar on Earth

The build emits **352 chunks / 16.8 MB** of assets. Among them: `emacs-lisp` (780 KB),
`cpp` (626 KB), `wasm` (622 KB), `wolfram` (262 KB), `vyper`, `mojo`, `blade`, `racket`,
`fortran-free-form`, `objective-cpp`. `ShikiCode.tsx:16-32` declares a 19-language allowlist,
but importing the `shiki` barrel pulls the full registry regardless.

Fix: `shiki/core` + `createHighlighterCore` with explicit `import('@shikijs/langs/tsx')`
entries, or `shiki/bundle/web`. Expect the asset count to drop from 352 to ~40.

### 5.3 Mermaid and Babel dominate the runtime cost

- `flowchart-elk` 1.45 MB (444 KB gzip) — you don't use ELK layouts; import mermaid's
  core registry and register only flowchart/sequence/class/state.
- `@babel/standalone` 2.98 MB (683 KB gzip), downloaded before the first test run. Swapping
  to **Sucrase** (~50 KB, TS/JSX-only, no transforms you don't need) or `esbuild-wasm`
  would cut this by an order of magnitude. Sucrase is the natural fit — it does exactly the
  strip-types-and-JSX job you need.
- The eager entry chunk is 1.20 MB / 378 KB gzip. There is no route-level code splitting;
  all 57 modules' metadata, all 3 locales, and every route component load on first paint.

### 5.4 Things that are missing rather than wrong

| Gap | Why it matters when you scale |
|---|---|
| No ESLint / Prettier | 4 tracks × multiple contributors, no shared floor |
| No tests for the platform | the sandbox, extractors and harness are the riskiest code in the repo and are entirely untested |
| No CI | nothing stops a broken `sectionHeading` from shipping |
| No content validator | §9.1 — the single highest-leverage thing you can build |
| No search | 57 modules today, ~120 after four more tracks. A flat sidebar list stops working around 30. |
| No analytics / no accounts | progress is localStorage-only: clearing the browser destroys everything, and nothing syncs across devices. Add export/import JSON as a cheap first step. |
| `zod` not used | you validate nothing at the content boundary; a schema would make §9.1 nearly free |

### 5.5 Accessibility — measured, not guessed

- **0** `aria-*` or `role=` attributes in the entire `platform/src` tree
- **0** `focus-visible` styles outside `components/ui/`
- **18** hand-rolled `<button>` elements, **0** uses of the `Button` primitive
- `Card` and `Badge` primitives: **0** uses outside the styleguide page

You have a documented design system (`DESIGN_SYSTEM.md`, 11 sections) and three UI
primitives that implement it correctly — and the application does not use any of them. The
icon-only theme and sidebar buttons rely on `title` alone, which screen readers treat
inconsistently.

Also: flag emojis (🇬🇧🇮🇹🇫🇷) don't render on Windows Chrome. The language menu currently
reads "FR FR" instead of "🇫🇷 FR". Use inline SVG or plain language codes.

---

## 6. The pedagogical gap

Across 634k words, grep finds **zero** occurrences of: `capstone`, `mini-project`,
`quiz`, `self-check`, `checkpoint`, `knowledge check`. This is the "project time" you
flagged, and it's the biggest content gap — bigger than any bug above.

What a learner can do today: read a lesson, then fill in a function stub that a hidden test
grades. What they cannot do: build anything, check their own understanding, apply two
concepts together, or produce something they'd show someone.

Also structurally missing:

- **Exercise coverage collapses after React.** 67 exercises in React, 4 in React Native
  (one module out of 21), **0 in JavaScript** (24 modules). Two-thirds of your modules are
  read-only.
- **No feedback beyond pass/fail.** No reference solution reveal, no "why", no diff against
  an idiomatic implementation.
- **No time estimates**, no difficulty ratings, no prerequisites graph. Module 06 assumes
  hooks; nothing says so.
- **No glossary, no cross-links.** The JS track defines closures; the React track uses them
  without linking back.
- **Linear-only navigation.** No "I already know this, skip it" path, no way in for someone
  who wants only the Zustand section.

### Recommended content unit (per module)

```
Module
├── Lessons          (exists)
├── Exercises        (exists — but only in React)
├── Checkpoint quiz  (NEW — 5–8 questions, instant feedback, ~10 min)
├── Mini-project     (NEW — multi-file, uses 3+ concepts, ~60–90 min, self-graded checklist)
└── Reference recap  (NEW — cheat sheet + glossary links + "what to read next")
```

And per track, one **capstone**: a real app built over several modules. React → a data
dashboard with routing, forms, fetching and tests. JS → a CLI tool. GIS → a working web map
with layers and geocoding. Node → a REST API with auth and tests. That's the thing people
put in a portfolio, and it's what turns a guide into a course.

### On visuals

611 mermaid diagrams is excellent and unusual. Worth adding, roughly in value order:

1. **Runnable diagrams** — the mermaid you already have, but with a "try it" link into a
   preflight sandbox
2. **Before/after code diffs** rather than two separate blocks
3. **Annotated screenshots** for anything tool-related (DevTools, Expo, QGIS, a browser
   network tab). There are currently zero images; some topics genuinely need one.
4. **Interactive demos** for concepts a diagram can't carry: the event loop, re-render
   cascades, CSS box model, coordinate projections. These are the highest-value and most
   expensive; pick 3–5 per track, not 30.

---

## 7. What breaks when you add GIS / Node / Python

### 7.1 The blast radius of one new track

Adding a track today means editing **8 places**, 2 of which contain untranslated English:

| File | Change | Problem |
|---|---|---|
| `types/exercise.ts:25` | widen the `Track` union | typed, so at least the compiler helps |
| `data/<track>-modules.ts` | new file, ~500 lines of hand-written metadata | |
| `data/modules.ts` | import + spread | |
| `layout/Sidebar.tsx:8` | `trackConfig` entry | **hard-coded English label + emoji** |
| `progress/ProgressDashboard.tsx:8` | `trackMeta` entry | **hard-coded English title + subtitle**, plus a `.replace(' Mastery','')` hack |
| `scripts/copy-content.js:23` | add exercise dirs to `sources` | **miss this and it 404s in production only** |
| `i18n/locales/{en,fr,it}.json` | modules/steps/exercises keys | 3 files, manual |
| `store/ui-store.ts:29` | possibly the default track | |

Four new tracks = 32 edits, no validation, and the sidebar/dashboard grow untranslated
strings.

### 7.2 The exercise runner cannot run Node, Python or GIS

This is the hard structural blocker. The whole execution pipeline —
`transpiler.ts` (Babel TS/JSX) → `(0, eval)` → `test-harness.ts` (a hand-written 536-line
Jest clone with 21 matchers) → `@testing-library/react` — is **React-in-a-browser and
nothing else**.

- **Node.js** needs a Node runtime, `fs`, `http`, npm. Options: WebContainers (StackBlitz,
  free for open source, runs real Node in the browser), or a server-side runner.
- **Python** needs **Pyodide** (CPython on WASM, mature, ~6 MB) or a server runner.
- **GIS** is mostly *not* a code-execution track — it's maps, layers, projections,
  QGIS/PostGIS workflows. It needs a **map-based interactive component**
  (MapLibre GL / Leaflet) far more than it needs a test runner. Some of it is a
  server-side PostGIS query console.

**Decision you must make before writing any GIS/Node/Python content:** exercises are a
*pluggable runner interface*, not a hard-coded React sandbox.

```ts
interface ExerciseRunner {
  id: 'react-browser' | 'node-webcontainer' | 'python-pyodide' | 'map-interactive' | 'quiz';
  compile(source: string): Promise<string>;
  run(compiled: string, spec: string): Promise<TestRunResult>;
}
```

Each track declares its runner; `ExerciseStepView` picks one. Without this, tracks 4–7 are
read-only guides and the platform stops being interactive exactly when the library gets big.

### 7.3 Other things that will not survive the scale-up

- **`module.number` collides across tracks.** Modules 1–12 exist three times over.
  `getModuleByNumber(n)` without a track argument (`modules.ts:1077`) returns whichever
  comes first. Harmless today; a latent bug the moment anything deep-links by number.
- **A flat sidebar of 57 modules** already needs scrolling. At ~120 it's unusable. Needs
  grouping, collapse, and search.
- **`en.json` is 1,475 lines and monolithic.** At 7 tracks it's ~5,000 lines × 3 languages.
  Split per-track and lazy-load per language (i18next backend).
- **Translation debt compounds.** JS (24 chapters, ~76k words) is already untranslated while
  the tracking doc claims full coverage. Each new track adds a third language backlog.
  Decide now whether tracks 4+ are English-only.
- **`public/raw/` duplicates all content** (5.4 MB, wiped and re-copied on every build). At
  7 tracks that's ~15 MB copied per build.
- **`dist/` is 21.9 MB.** Growth is superlinear in chunks, not content.

### 7.4 Documentation drift

- `README.md` is the repo's front door and describes a **React-only, 12-module,
  CLI-and-Jest project** where modules 02–12 are "🚧 Coming Soon". They're done. It never
  mentions the platform, React Native, or JavaScript. Anyone new starts from a wrong map.
- The root `src/` + `scripts/` + `jest.config.js` are a **second, legacy delivery mechanism**.
  `scripts/check-progress.js` hard-codes the 12 React modules; `test-runner.js` rejects
  module numbers above 12 and can't see `rn-`/`js-` dirs. Either retire it or make it
  track-aware — right now it's a trap.
- `TRANSLATION-TODO.md` states FR/IT chapters are "condensed (~250 lines vs 1,300–2,800)".
  They aren't any more — every React chapter is line-for-line identical across en/fr/it. It
  also documents a convention ("`##` headings kept in English") that the translations no
  longer follow, which is precisely what causes bug §4.2(a).
- `spec.md`, `repo-guide.md`, `architecture.md`, `specifications.md` are **gitignored**
  (`.gitignore:43-46`). The project's specifications exist only on one machine.

---

## 8. Recommended restructure

Two changes carry most of the value. Neither requires a rewrite.

### 8.1 Content as data, not as TypeScript

Move module metadata out of `data/*.ts` and into frontmatter beside the content, then
**generate** the manifest at build time.

```
content/
  react/
    track.yml                     # id, label(en/fr/it), icon, runner, order
    01-fundamentals/
      meta.yml                    # number, status, prerequisites, estimatedMinutes, difficulty
      lesson.en.md                # frontmatter per ## section: id, title, order
      lesson.fr.md
      lesson.it.md
      exercises/
        01-greeting/
          meta.yml                # componentName, hints(en/fr/it), difficulty
          starter.tsx
          solution.tsx            # NEW — reveal after passing
          spec.test.tsx
      quiz.yml                    # NEW
      project.md                  # NEW
  javascript/ …
  gis/ …
```

Build step emits `manifest.json` (+ per-track chunks). What this buys:

- One source of truth per fact — the drift in §4.1, §4.2 and the hint-count mismatches
  becomes **structurally impossible**
- A section without a step can't exist; a step without a section can't exist
- Adding a track = adding a folder, not editing 8 files
- Translations live next to what they translate
- Content contributors never open TypeScript

### 8.2 Derive steps from headings, delete the fuzzy matcher

`findSection`'s four-strategy fallback (`section-extractor.ts:60-86`) exists to paper over
drift between two hand-maintained lists. With §8.1, the step *is* the section — no lookup,
no fallback, no silent mismatch, no bug §4.2(a). Delete ~40 lines and a whole class of bug.

### 8.3 Pluggable exercise runners

Per §7.2. Do this *before* the first non-JS track, not after.

### 8.4 Route-level code splitting + a per-track i18n bundle

`React.lazy` per route, `manifest.json` fetched per track, i18next HTTP backend for locales.
Turns "load everything for 7 tracks" into "load what this learner opened".

---

## 9. Prioritized plan

### Phase 0 — build the safety net (~1 day, do this first)

**9.1 A content validator.** ~150 lines of Node. The audit script written for this review
already implements most of it and found 8 distinct classes of drift in one run. It should
check, and fail CI on:

- every `sectionHeading` resolves **exactly** (no fuzzy) in **every** locale
- no orphaned sections (§4.1) and no orphaned steps
- every `exerciseDir` exists, has `index.tsx` + `index.test.tsx`, an `// EXERCISE N:` banner
  per exercise, an exported `componentName`, and a matching `describe("Exercise N")`
- every module/step/exercise id has a key in all three locales
- hint counts match across locales
- every `exerciseDir` appears in `copy-content.js`
- no duplicate ids; `(track, number)` unique

Plus: ESLint + Prettier, a GitHub Actions workflow running `validate → lint → tsc → build`,
`.editorconfig` + `.gitattributes` (kill the BOMs and CRLF).

### Phase 1 — fix what's broken (~2–3 days)

1. Add the 39 missing steps (§4.1) — the single biggest content win available, it's already
   written and translated
2. Fix module 04's `sectionHeading` values; add content-type validation to `loadGuideContent` (§4.2)
3. Delete `preprocessTypeScript` (§4.3)
4. Implement `afterEach`/`beforeAll`/`afterAll` (§4.4)
5. Bundle Monaco locally (§5.1)
6. Fix the dashboard progress bar and the LivePreview remount (§4.7, §4.8)
7. Add `favicon.svg`, `errorElement`, a 404 route, `lang` sync, store `version`/`migrate`,
   debounced `saveCode`
8. Rewrite `README.md`; un-gitignore the spec docs; retire or fix the legacy `scripts/`

### Phase 2 — restructure before scaling (~1–2 weeks)

9. Content-as-data + generated manifest (§8.1, §8.2)
10. Pluggable exercise runners (§8.3)
11. Real iframe sandbox + execution timeout (§4.5); allowlist the `/raw` middleware (§4.6)
12. Shiki/Mermaid/Babel trimming + route splitting (§5.2, §5.3, §8.4) — target: entry chunk
    under 200 KB gzip, under 50 chunks
13. Sidebar search + track grouping; progress export/import
14. Adopt the `ui/` primitives across all 18 buttons; add focus rings and aria labels (§5.5)

### Phase 3 — close the pedagogy gap (ongoing)

15. Quizzes per module (start with React — highest traffic)
16. Mini-projects per module + one capstone per track
17. Reference solutions revealed after passing
18. Time estimates, difficulty, prerequisites graph
19. Exercises for the JS and RN tracks (currently 0 and 4)
20. Glossary + cross-track links

### Phase 4 — new tracks

Only after Phase 2. Suggested order by reuse of existing machinery:

1. **Node.js** — closest to what exists; WebContainers runner; JS track is its prerequisite
2. **Python** — Pyodide runner; self-contained
3. **GIS** — needs the map component; largest new surface
4. Others once the pattern is proven twice

---

## 10. The short version

The content is the asset and it's good. The platform is a solid prototype whose seams are
now visible: three hand-maintained sources of truth joined by fuzzy string matching, with no
validation, so a quarter of the React track is invisible and two locales hit error screens.

Before adding a single GIS or Python chapter:

1. **Build the validator and CI** — nothing else stays fixed without it
2. **Surface the 17,600 words already written and translated**
3. **Make exercise execution pluggable** — otherwise 4 of 7 tracks will be read-only
4. **Move content out of TypeScript** — otherwise every track multiplies the drift
5. **Add projects and quizzes** — otherwise it's a very good reference, not a course

Items 1–3 are roughly two weeks. Item 4 is another one to two. Doing them after four more
tracks land costs several times that.
