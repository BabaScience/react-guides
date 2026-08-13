# Remediation Plan

Companion to [ANALYSIS.md](ANALYSIS.md). Ordered by dependency, not just severity —
the safety net comes first so nothing regresses while the rest is fixed.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

**Phase 0, Phase 1 and P2.1–P2.4 are complete.** Gate at the time of writing:
`npm run validate` → *Content valid, 2 warnings* (both the documented
JS-translation gap) · `npm run lint` → 0 errors · `tsc -b` → 0 errors ·
`npm run build` → succeeds, entry chunk 528 KB / 172 KB gzip, 62 chunks.

---

## Phase 0 — Safety net

Nothing below stays fixed without this. Build it first.

### [x] P0.1 — File hygiene
1. Add `.editorconfig` (LF, UTF-8 no BOM, 2-space).
2. Add `.gitattributes` (`* text=auto eol=lf`, binary rules for `.pptx`/images).
3. Strip the UTF-8 BOM from all 116 chapter files.
4. Normalize the 8 CRLF files to LF.

**Done when:** `git diff --stat` shows the encoding-only churn once, and re-running the
BOM scan reports 0.

### [x] P0.2 — `scripts/validate-content.mjs`
Bundle `platform/src/data/modules.ts` with esbuild, then assert:

| Check | Failure mode it prevents |
|---|---|
| every `sectionHeading` matches an H2 **exactly**, in en + fr + it | §4.2(a) dead lessons |
| no H2 lacks a step (except `Table of Contents`) | §4.1 unreachable content |
| no step lacks an H2 | broken timeline entries |
| `exerciseDir` exists with `index.tsx` + `index.test.tsx` | 404s |
| each exercise has an `// EXERCISE N:` banner | editor silently loads the whole file |
| each `componentName` is exported | LivePreview "not exported" |
| each exercise has a `describe("Exercise N")` | 0 tests run, silently |
| steps ↔ exercises are 1:1 within a module | unreachable exercises |
| every id has en/fr/it keys | untranslated fallback |
| every exercise has hints in all three locales, same count | §4.9 drift |
| every `exerciseDir` is listed in `copy-content.js` | prod-only 404 |
| ids unique; `(track, number)` unique | ambiguous lookups |

Exit non-zero on any error. `--warn-only` flag for local exploration.

**Done when:** `npm run validate` exits 0 on a clean tree and non-zero if you break any
one of the above on purpose.

### [x] P0.3 — Lint + format
ESLint flat config (`typescript-eslint`, `react-hooks`, `react-refresh`) + Prettier.
Scripts: `lint`, `lint:fix`, `format`. Fix everything it flags.

### [x] P0.4 — CI
`.github/workflows/ci.yml`: `validate → lint → tsc -b → build` on push and PR.

---

## Phase 1 — Fix what's broken

### [x] P1.1 — Surface the 39 unreachable sections
For each React module, add the missing `Step` entries in the right pedagogical position
(not appended at the end), with `sectionHeading` matching the English H2 **exactly**, plus
`steps.<module>.<id>` titles in en/fr/it.

**Done when:** the validator's orphan check passes with zero exceptions, and step counts
rise from 345 to ~384.

### [x] P1.2 — Fix module 04 section headings
Restore the leading `N.` on all 7 `stylingSteps` entries so translated chapters resolve.
Section lookup was also changed from text matching to **ordinal** lookup (find the heading
in the English chapter, take the same position from the localized one), which removes the
fuzzy fallback and fixes unnumbered headings like `Conclusion:` too.

**Done when:** French module 04 renders all its steps (now 17) instead of erroring on 7.

### [x] P1.3 — Harden `loadGuideContent`
Reject a response whose body starts with `<!DOCTYPE`/`<html` or whose content-type is
`text/html`, so the localized→English fallback actually fires. Same guard for the exercise
stub/test loaders.

**Done when:** the JS track renders English content under `lng=fr` on the dev server.
✔ verified — previously every JS lesson showed *"Section … introuvable"*.

### [x] P1.4 — Delete `preprocessTypeScript`
Remove the function and its three call sites; let Babel handle TS.

### [x] P1.5 — Real `afterEach` / `beforeAll` / `afterAll`
Full Jest hook semantics: outermost-first `beforeEach`, innermost-first `afterEach`,
`beforeAll`/`afterAll` once per suite. `describe` now nests properly and the exercise
filter matches the full suite path, so hooks declared in an outer `describe` reach nested
tests. The internal DOM sweep still runs last, after every user hook.

### [x] P1.6 — Bundle Monaco
`npm i monaco-editor`, `loader.config({ monaco })` in `src/monaco-setup.ts`, workers via
Vite `?worker` imports. `CodeEditor` is behind `React.lazy` so Monaco's ~5 MB lands in its
own chunk instead of the entry.

**Done when:** zero `cdn.jsdelivr.net` requests at runtime.
✔ verified in both dev and the production build — `external: []`, editor renders, tests run.

### [x] P1.7 — Reactivity fixes
Dashboard progress via a store selector; split LivePreview's compile effect (`code`) from
its render effect (`currentProps`).

### [x] P1.8 — App shell hardening
`favicon.svg` · `errorElement` + catch-all 404 · `<html lang>` synced to i18n ·
`version` + `migrate` on both persisted stores · debounced `saveCode` ·
lesson marked complete on any forward navigation.

### [x] P1.9 — Dead code + honest comments
Delete `CodeBlock.tsx`, `ExerciseChecklist.tsx`, `sandbox/types.ts`. Fix the comment
citing a nonexistent `react-act-shim.ts`. Fix LivePreview's "sandboxed"/"no props" claims.
Rename `sandbox-iframe.ts` → `test-runner.ts`.

### [x] P1.10 — Documentation
Rewrite `README.md` for the 3-track platform. Un-gitignore the spec docs. Make the legacy
root runner track-aware or retire it.

---

## Phase 2 — Restructure before scaling

### [x] P2.1 — Bundle diet
Shiki core + 9 explicit grammars with the JS regex engine (drops the oniguruma
WASM) · `@babel/standalone` → Sucrase, and `@babel/parser` alone for the props
extractor · Monaco cherry-picked (no CSS/HTML/JSON services or their workers)
and behind `React.lazy` · `React.lazy` per route · dropped unused
`rehype-highlight`.

| | before | after |
|---|---|---|
| entry chunk | 1,204 KB / 378 KB gzip | **528 KB / 172 KB gzip** |
| chunks | 443 | **62** |
| `dist/assets` | 30.1 MB | **18 MB** |

Target was < 50 chunks / < 5 MB. Not met, and the remainder is understood: Monaco's
TypeScript worker alone is 6.8 MB and the editor chunk 3.6 MB. That is the price of
real TS diagnostics in the exercise editor, which the project deliberately wants
(it feeds Monaco the actual `@types/react`). Both are lazy — a reader who never
opens an exercise never downloads them. Mermaid's diagram types (~15 chunks) are
lazy per diagram kind and were left alone.

**Also fixed here (found while verifying):** the production test runner could not
render *anything*. The `patch-testing-library-act` plugin ran the callback and
*then* called `flushSync(() => {})`, which does not commit a `root.render()`
scheduled on the default lane — so every rendering exercise failed on the
deployed site. Running the callback inside `flushSync` fixes it: module 10
exercise 3 went 0/3 → **3/3**, module 01 exercise 7 went 0/4 → **3/4** in a
production build. This was pre-existing — verified by rebuilding with Babel,
which fails identically — and is what the "Mark as completed manually" escape
hatch in `progress-store.ts` was built to work around. The last 1/4 is the
`user-event` limitation carried into P2.2.

`toHaveBeenCalledWith` now reports what the mock *was* called with, not only what
was expected — that is how the remaining failure was diagnosed.

### [~] P2.2 — Sandbox hardening

**Done — `/raw` middleware allowlist.** The dev middleware bypassed Vite's own
`server.fs` guard and resolved any path under the repo root: `GET
/raw/.git/config` returned the repository's remote URL, and `.env` would have
been readable the same way. It is now restricted to `arguments/chapters`,
`src/`, and the two `@types` directories Monaco needs, with an extension
allowlist and decode-then-resolve traversal checks. Verified: `.git/config`,
`package.json` and `%2e%2e` traversal all fall through; real content still
serves.

**Done — the flush moved to where it belongs.** `act` is now a plain
pass-through and the single `flushSync` lives in the runner's `render`
interceptor. Same results as the P2.1 fix (3/3, 3/4) with a much clearer
rationale, and event dispatch is no longer wrapped in a sync flush.

**Tried and rejected — pinning `IS_REACT_ACT_ENVIRONMENT` to false.**
The suspicion was right in principle: TL sets that flag around every render,
which parks updates on an act queue that a pass-through `act` never drains.
But forcing it false makes TL's `asyncWrapper` await something that never
settles, and the whole run hangs. Recorded in test-runner.ts so nobody
re-derives it.

**Deferred into P2.6 — iframe isolation + execution timeout.** Deliberately,
not for lack of time:
- A same-origin iframe shares the event loop, so `while (true)` still freezes
  the tab. A cross-origin one cannot load our modules without CORS. Neither
  gives the watchdog its stated purpose, so an iframe built now would deliver
  isolation but not the timeout.
- The remaining `user-event` gap needs a context with React's **development**
  build, which means a separate execution context with its own module graph —
  exactly what the runner interface in P2.6 has to define anyway.
- Node (WebContainers) and Python (Pyodide) bring their own isolated contexts.
  Designing the host once, in P2.6, avoids building a React-only iframe and
  then rebuilding it.

### [x] P2.3 — Design system + a11y
`Button` adopted for every real button (Run Tests, Mark complete, Reset ×2); `Badge`
for the "coming soon" chip. The controls that stayed hand-rolled — track switcher,
tab strips, sidebar collapse, disclosure toggles — are genuinely not `Button`
variants, so they got the treatment they were missing instead: focus rings
everywhere, and ARIA that carries state rather than colour.

Fixed along the way:
- **The language menu was hover-only** — unreachable by keyboard, invisible to
  screen readers. Now a real disclosure with `aria-haspopup` / `aria-expanded`,
  `role="menuitemradio"` + `aria-checked`, outside-click and Escape handling.
- **The code-block copy button was `opacity-0` until hover**, so keyboard users
  tabbed onto an invisible control. Added `focus-visible:opacity-100`.
- **Flag emoji replaced with language codes + endonyms.** Regional-indicator pairs
  don't render on Windows — the picker literally read "FR FR".
- **Skip link** added; the sidebar is ~60 tab stops before the content.
- `trackMeta.title.replace(' Mastery', '')` replaced with a stored `shortLabel` —
  the old derivation breaks the moment a title is translated.

Counts went from 0 aria attributes / 0 focus rings outside `ui/` to 17 labels,
6 `aria-pressed`, 11 progressbars, 2 labelled `nav` landmarks, 24 focus rings.
Documented in DESIGN_SYSTEM.md §6.5 and rendered as `/styleguide` §8.

### [x] P2.4 — Navigation at scale
**Sidebar search.** Filters on module name, description, id *and step titles* — so
typing `usereducer` finds the Hooks module even though its name never says it
(verified: 12 modules → 1). `useDeferredValue` keeps typing smooth at 57 modules,
and the result count is announced via `role="status"`.

**Progress export/import.** Progress lives only in this browser's localStorage —
clearing site data or switching machine destroyed every solved exercise and every
line of saved code. Now exportable as a dated JSON file and importable back,
merging by default so importing from another machine doesn't discard local work.
Verified round-trip including saved code, plus rejection of unrelated JSON and of
files written by a newer store version.

*Not done: collapsible track groups.* The track switcher already partitions the
list, and the data has no sub-grouping inside a track — search covers the "57 → 120
modules" problem that grouping was meant to solve, without adding a second
navigation concept.

### [ ] P2.5 — Content as data *(the big one)*
Move module metadata out of `data/*.ts` into `content/<track>/<module>/meta.yml` +
per-locale markdown with per-section frontmatter. Generate `manifest.json` at build time.
Derive steps from headings and delete `findSection`'s fuzzy fallback entirely.

### [ ] P2.6 — Pluggable exercise runners
```ts
interface ExerciseRunner {
  id: 'react-browser' | 'node-webcontainer' | 'python-pyodide' | 'map-interactive' | 'quiz';
  compile(source: string): Promise<string>;
  run(compiled: string, spec: string): Promise<TestRunResult>;
}
```
Track declares its runner; `ExerciseStepView` dispatches. **Blocks all non-JS tracks.**

Carries the deferred half of P2.2: each runner owns an isolated execution
context (iframe / WebContainer / Pyodide worker) with a watchdog. The
`react-browser` runner loads React's **development** build there, which gives it
a working `act()` and closes the last test-runner gap — a handler reading state
after `user.type` currently still sees the initial value.

---

## Phase 3 — Close the pedagogy gap

### [ ] P3.1 — Quizzes (`quiz.yml` per module, 5–8 questions, instant feedback)
### [ ] P3.2 — Mini-projects per module + one capstone per track
### [ ] P3.3 — Reference solutions revealed after passing
### [ ] P3.4 — Time estimates, difficulty, prerequisites graph
### [ ] P3.5 — Exercises for the JS (0 today) and RN (4 today) tracks
### [ ] P3.6 — Glossary + cross-track links

---

## Phase 4 — New tracks

Only after P2.5 and P2.6. Order by machinery reuse:
**Node.js** (WebContainers) → **Python** (Pyodide) → **GIS** (MapLibre component) → rest.
