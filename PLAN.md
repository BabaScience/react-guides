# Remediation Plan

Companion to [ANALYSIS.md](ANALYSIS.md). Ordered by dependency, not just severity —
the safety net comes first so nothing regresses while the rest is fixed.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

**Phases 0, 1 and 2 are complete**, P2.2 included — grading now runs in an
isolated frame. Phase 3 (pedagogy) is started: P3.1 covers the whole React
track, and nothing else in Phase 3 has been attempted. Phase 4 (new tracks) has
not begun.

Gate, re-run against the current tree: `npm run manifest` → *57 modules, 394
steps, 67 exercises* · `npm run validate` → *Content valid, 2 warnings* (both
the documented JS-translation gap) · `npm run lint` → 0 errors · `tsc -b` → 0
errors · `npm run build` → succeeds, entry chunk 532 KB / 172 KB gzip, 60
chunks, `dist/assets` 17 MB.

`npm run dev` and `npm run build` both run `sandbox:build` first (via `predev` /
`prebuild`), so `public/sandbox-host.js` is never stale. Editing anything under
`sandbox-host/` while a dev server is already running needs a restart.

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

### [x] P2.2 — Sandbox hardening

**Done — `/raw` middleware allowlist.** The dev middleware bypassed Vite's own
`server.fs` guard and resolved any path under the repo root: `GET
/raw/.git/config` returned the repository's remote URL, and `.env` would have
been readable the same way. It is now restricted to `arguments/chapters`,
`src/`, and the two `@types` directories Monaco needs, with an extension
allowlist and decode-then-resolve traversal checks. Verified: `.git/config`,
`package.json` and `%2e%2e` traversal all fall through; real content still
serves.

**Done — the flush moved to where it belongs.** `act` became a plain
pass-through and the single `flushSync` moved into the runner's `render`
interceptor. Same results as the P2.1 fix (3/3, 3/4) with a much clearer
rationale, and event dispatch was no longer wrapped in a sync flush.
*(Superseded: the isolated frame runs development React, whose `act()` works,
so both the pass-through and the interceptor are gone — see below.)*

**Tried and rejected — pinning `IS_REACT_ACT_ENVIRONMENT` to false.**
The suspicion was right in principle: TL sets that flag around every render,
which parks updates on an act queue that a pass-through `act` never drains.
But forcing it false makes TL's `asyncWrapper` await something that never
settles, and the whole run hangs. Recorded in test-runner.ts so nobody
re-derives it.

**Done — real isolation.** Grading runs in an
`<iframe sandbox="allow-scripts allow-forms">`. Omitting `allow-same-origin` is
the whole mechanism: it puts the frame on an **opaque origin**, so learner code
gets a `SecurityError` for `localStorage` (which holds every solved exercise and
every line of saved code) and for `parent.document`. Verified through the real
runner, not a mock — a solution that reads either one fails the exercise with
`ISOLATION LEAK`; it passes 3/3, so both were blocked.

The deferral above assumed this needed "a deployment change" — a second origin
to serve the sandbox from. **It doesn't, and that assumption was the only thing
keeping the work parked.** An opaque origin is already cross-origin to the
parent, and the CORS problem disappears if nothing is ever fetched *from* the
frame: the parent fetches the runtime (an ordinary same-origin request) and
hands it over as inline text in `srcdoc`.

- `sandbox-host/main.ts` + `vite.sandbox.config.ts` build one self-contained
  IIFE to `public/sandbox-host.js`, carrying React's **development** build.
  Emitted into `public/` so dev and prod load it by the identical path —
  §4.2(b) was a bug that existed only because the two resolved differently.
- `src/sandbox/isolated-frame.ts` owns the frame, handshake and RPC. Each run
  gets a fresh frame, and `dispose()` is now a real kill switch: tearing down
  the frame takes its timers and pending promises with it, which the in-page
  `Promise.race` never could.
- `test-runner.ts` (317 lines) is deleted, and with it the
  `patch-testing-library-act` Vite plugin, the `flushSync` render interceptor
  and the `test-root` + `screen` Proxy scoping. The frame's body holds the
  render output and nothing else, so TL's own `screen` is correctly scoped.
  `@testing-library` is now absent from the app bundle entirely: 63 → 60
  chunks, `dist/assets` 18 MB → 17 MB, entry chunk unchanged at 172 KB gzip.

Two things the browser enforces that the design had to answer for:
`allow-forms` is required or the browser blocks form submission outright and
every controlled-form spec fails with "onSubmit was never called"; and the
frame must be laid out at a real size, because a 0×0 document gives its
elements no layout box and user-event v14 then refuses to type into them.
*Where* it is positioned turns out to matter just as much — see the throttling
note below.

**Fixed — the frame must be rendered, not hidden off-screen.** For a while the
two `user.type`-driven specs in module 01 (exercise 7 ContactForm, exercise 8
FilteredList) timed out at the watchdog on every attempt, while the six
exercises without `user-event` passed in under a second.

The cause was the frame's own CSS. It was parked at `left:-10000px` to keep it
out of sight, and **Chrome throttles timers in an off-screen cross-origin
iframe to roughly one per second.** `user-event` awaits a timer between
keystrokes, so every character cost about a second: typing "John Doe" took
4.8s in the first test and 11.0s in the second, and four tests blew through
any budget. Bisected with a hand-written spec against the same bundle —
identical work, **16219ms off-screen versus 498ms in-viewport**.

`opacity:0` at full size inside the viewport keeps the frame rendered (so its
timers run at normal speed) while showing nothing. `clip-path:inset(100%)` is
throttled just like off-screen positioning and is not an alternative; a 0×0
box breaks user-event differently, by leaving the document with no layout.

Module 01 now runs uniformly in ~0.8s per exercise: 3/3, 3/3, 4/4, 5/5, 6/6,
4/4, **3/4**, **3/6**. `DEFAULT_TIMEOUT_MS` went back down to 20s, the 45s
having been justified by a slowness that turned out to be this bug.

Two lessons worth keeping: the earlier "restored the 3/4 baseline, no
regression" claim came from runs that happened to land before throttling
engaged, so it was luck reported as verification; and the first
`IS_REACT_ACT_ENVIRONMENT` experiment was run against a throttled frame, where
the throttling dominated and the comparison proved nothing.

**Root cause found — an opaque-origin frame cannot take focus, and
`user-event` runs entirely through focus.** This is the real content of the
"`user-event` gap", and it is a property of the sandbox, not of React.

Measured inside the frame, with `fireEvent` as the control:

| after | DOM value | derived text | renders |
|---|---|---|---|
| `user.type(input, 'ab')` | `""` | `"echo:"` | 1 → **1** |
| `fireEvent.change(…'zz')` | `"zz"` | `"echo:zz"` | 2 → **3** |

`fireEvent` dispatches straight at the element and works perfectly — which is
why the six exercises without `user-event` pass, and why `Counter` (five
`fireEvent.click` cases) is 5/5. `user.type` is a no-op: no value, no
re-render. `user.click` does not even focus its target, and `user.keyboard`
after an explicit `input.focus()` does nothing either, because the focus never
took: `document.activeElement` stays `BODY`.

The isolating comparison — same tab, same styling, same moment, only the
sandbox differing:

| frame | `activeElement` after `focus()` |
|---|---|
| `sandbox="allow-scripts allow-forms"` | `""` — focus refused |
| same-origin, no sandbox | `"i"` — focus works |

So `allow-same-origin` is exactly what would fix typing, and it is exactly what
cannot be granted without giving learner code the app's origin and its
localStorage back. That is the trade P2.2 actually made, now stated plainly.

**Unresolved: how much of this reaches a real learner.** Results for the two
typing exercises are not stable — the same code gives 3/4 in ~1.2s on one run
and a watchdog timeout on the next. It tracks whether the top document holds
focus, which this environment could not hold steady (the browser pane is
reported `hidden`, and creating the frame appears to cost the page its focus).
A learner with a focused, foreground tab may well be fine; a learner who
switches tab mid-run would see typing tests fail with a misleading "element not
in the document". Verifying that needs a hands-on run in a normal browser.

**Taken: route per exercise.** `react-browser.ts` now picks the context with
`needsFocus(spec, exerciseNumber)`. Exercises whose own `describe` block
touches `user-event` run in the page via the restored `test-runner.ts`;
everything else keeps the isolated frame. `patch-testing-library-act` came back
with it, since the in-page path uses the app's production React — and the
sandbox build still excludes that plugin, because the frame's development React
needs no patching.

The check has to be per *exercise*, not per file, and the first version got
this wrong. A module's exercises share one spec, and that spec imports
`user-event` at the top for whichever block needs it, so matching on the import
sent all eight of module 01's exercises down the weaker path and quietly gave
up the isolation for six of them. Verified after the fix: greeting runs in the
FRAME at 3/3, counter 5/5 and action-button 4/4 in ~1s, contact-form in-page.

**Not yet proven to help.** In this environment the two typing exercises still
hit the watchdog on the in-page path, with `document.hasFocus()` true
throughout — the same timeout they hit in the frame. Both paths now fail
identically here, including the one that historically produced 3/4, which
points at something about this automated browser rather than the routing. The
routing is right on the evidence and costs little; whether it restores 3/4
needs one hands-on run in an ordinary browser.

Rejected alternatives: `allow-same-origin` (typing works, isolation gone — it
undoes the point of P2.2); and detect-and-warn (honest, but leaves the
exercises failing).

**Disproved — the `user-event` gap is not about production `act()`.** The
premise below, repeated in P2.6, was that the last failing case needs React's
development build. The frame now *has* one — verified in the built bundle: no
`Minified React error` strings, dev-only diagnostics present, and the
"act is not supported in production builds" throw path absent. Module 01
exercise 7 still scores exactly 3/4, failing the same case in the same way
(`onSubmit` receives `{name: "", email: ""}` while the DOM shows the typed
values). Setting `IS_REACT_ACT_ENVIRONMENT` before React initialises, rather
than after, changes nothing either. Whatever causes it, a real `act()` is not
the missing piece — so that lead is closed, and the next attempt should start
somewhere else.

**Still open — `LivePreview` is not isolated.** ANALYSIS.md §4.5 names two
call sites; this closed the grading one. `LivePreview.tsx` still evaluates
learner code in the main window. It renders into the page, so moving it behind
the frame is a UI change (render inside the frame, show the frame) rather than
a swap of the execution path.

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

### [x] P2.5 — Content as data *(the big one)*

Module metadata now lives in **`content/modules/<id>.yml`** — 57 hand-editable
files — compiled by `scripts/build-manifest.mjs` into
`platform/src/data/manifest.json`, which the app imports. The ~2,000 lines of
hand-written TypeScript across `modules.ts` / `rn-modules.ts` / `js-modules.ts`
are gone.

**The invariant that makes the whole class of bug impossible.** The compiler
refuses to emit a manifest unless every `## ` heading in a module's guide is
either claimed by a lesson step or listed under `skipSections`. §4.1 of the
analysis — 39 sections written, translated, and unreachable — can no longer
happen: it is a build failure, not a silent gap. Verified by breaking a module
file on purpose:

```
07-data-fetching.yml: 1 guide section(s) are neither a step nor skipped
                      — "5. SWR: Stale-While-Revalidate"
07-data-fetching.yml: steps[6] points at "8. Polling and Realtime Updates",
                      which is not a heading in the guide
```

**Migration was proved lossless** before anything was deleted: the generated
manifest was compared field-by-field against the compiled TypeScript —
*IDENTICAL, 57 modules, 384 steps, 67 exercises*.

**Ids are declared, not derived.** Deriving step ids by slugging headings would
have been tidier, and would have silently wiped every learner's completed
lessons — `lessonSteps["01-fundamentals/jsx-syntax"]` is a progress key. The YAML
declares ids and the compiler enforces the correspondence instead.

Also folded in:
- `copy-content.js` derives its source list from the manifest. The hard-coded
  directory list — a production-only 404 waiting for the next new module — is gone.
- The validator no longer bundles TypeScript with esbuild; it calls the compiler
  and keeps only the checks the compiler can't make (translated chapters,
  exercise files on disk, locale coverage, encoding).
- `getModuleByNumber(num, track)` now *requires* the track. It was optional, and
  module numbers repeat across tracks.
- `manifest.json` is committed and CI runs `--check`, so editing the YAML without
  regenerating fails the build.

Not done: moving the chapters themselves under `content/<track>/<module>/`.
The metadata was the part that drifted; relocating 117 markdown files would
churn every raw-content path for no correctness gain. `guide:` in each module
file points wherever the chapter lives, so that move stays available later.

### [x] P2.6 — Pluggable exercise runners

Grading is now behind an interface. A module names its runner in
`content/modules/<id>.yml`; omitted, it takes the track's default. Both exercise
views dispatch through `getRunner(module)` and know nothing about how the code
is executed.

```ts
interface ExerciseRunner {
  id: RunnerId;
  run(request: ExerciseRunRequest): Promise<TestRunResult>;
}
```

`react-browser` is implemented — it owns the reassembly, import-stripping and
grading that `ExerciseStepView` used to do inline. `node-webcontainer`,
`python-pyodide`, `map-interactive` and `quiz` are registered as *planned*
runners that report themselves to the learner instead of throwing, so a track
can ship its lessons before its grader exists. The manifest compiler rejects an
unknown `runner:` value.

**`while (true)` is survivable now.** It used to freeze the tab permanently —
the click could not be undone, and unsaved work went with it. Every loop body
gets a guard call, placed by offsets from a real parse so `"while (true)"` in a
string or comment is untouched:

> Your code ran too long — check for a loop that never ends.

The guard's budget measures *time without the thread yielding*, not total run
time. A `setInterval` pushes the deadline forward; timers only fire when the
thread yields, so an honest slow run never trips it while a stuck one is caught
within one budget however long the run had been going. A fixed deadline gets
both halves wrong — the first attempt used one and took 23s to recover; this
takes ~7s with a 2s budget, and cannot false-positive on a slow-but-honest run.

A second `Promise.race` watchdog covers what the guard can't see: a runaway
`setInterval`, a promise that never settles.

Verified in a production build: a correct solution passes 3/3, a `while (true)`
reports the loop message in ~7s, and the `user-event` exercise still scores its
3/4 baseline — no regression from routing through the runner.

**Done in P2.2: real isolation.** Execution was `(0, eval)` in the main window
when this was written. It now runs in an opaque-origin frame carrying
development React — no deployment change was needed, and the frame *is*
killable. The prediction that this would close the last `user-event` gap turned
out to be wrong; see P2.2 for what was measured.

---

## Phase 3 — Close the pedagogy gap

### [~] P3.1 — Quizzes (5–8 questions, instant feedback)
**The React track is complete: all 10 modules that have content carry a
six-question checkpoint** (11-typescript and 12-advanced-patterns have no
lessons yet, so nothing to check). Across the platform that is 10 of 57;
React Native (21 modules) and JavaScript (24) are still untouched.

Questions are written against each chapter, and aimed at the misconception
rather than the definition — the stray `0` from `items.length &&`, a memoised
child defeated by an inline object literal, an effect whose slower first
request overwrites its newer second one. Each carries an explanation in all
three locales, because the explanation is the part that teaches.

Text lives inline in `content/quizzes/<module>.yml`, all locales together — a
question, its options and its explanation are one unit, and splitting them
across the locale JSONs by key path is the drift this project has been
removing. `en` is required; a missing locale falls back to it. A question with
more than one `correct: true` option is answered as a multi-select, worked out
by the view rather than declared.

The compiler enforces the correspondence in both directions, the same invariant
as P2.5: a step referencing a missing quiz file fails the build, and so does a
quiz file no step references — an unreachable quiz is the same failure as an
unreachable section.

`quiz` was dropped from `RunnerId`. It was listed there when the runner
interface was sketched; building it showed a quiz isn't graded by running code
and would have needed a fake code-shaped request. It is its own step type.
### [ ] P3.2 — Mini-projects per module + one capstone per track
### [ ] P3.3 — Reference solutions revealed after passing
### [x] P3.4 — Time estimates, difficulty, prerequisites graph

All 55 available modules carry all three. The two coming-soon modules carry
none, and the compiler requires `difficulty` only of an available module.

**Estimates are derived, not declared.** Fifty-seven hand-written numbers would
be guesses on day one and wrong the first time a chapter was edited. The
compiler counts the prose and code of *the sections a step actually points at*
— skipped sections cost the learner nothing — and adds a fixed price per
exercise and quiz. `estimatedMinutes:` still overrides it where the number is
plainly wrong.

Prose and code are counted separately, because a 40-line example is not 300
words of narrative. The first pass priced code at 6s/line and made module 02
a 5.5-hour commitment, 3.3 of it code — a number that described how heavily
fenced the chapter is rather than how long it takes. At a blended 3s/line the
spread is 10 min to 3h 50, median 35 min: React 32h, JavaScript 11h, React
Native 15h, **58h** of material in total.

**Prerequisites are a graph, not chapter order.** Styling does not require
component patterns; routing does not require styling; `rn-02-fundamentals`
requires `01-fundamentals` from the React track, which is the first cross-track
link in the project and answers §6's "the JS track defines closures; the React
track uses them without linking back". The compiler rejects a prerequisite that
is not a module id, a module that is its own prerequisite, and any cycle —
verified by breaking each on purpose:

```
prerequisite cycle: 01-fundamentals → 02-hooks → 01-fundamentals
02-hooks: prerequisite "99-nonexistent" is not a module id
01-fundamentals.yml: difficulty "easy" is not one of beginner, intermediate, advanced
```

Surfaced in `ModuleMeta` (shared by the dashboard card and the module header so
the two cannot drift) and as prerequisite chips on the module page, each a link
that shows a ✓ once that module is complete. Shown, never enforced: someone who
learned hooks elsewhere is not ours to gatekeep. Verified in en/fr/it.

*Not done: a visual graph.* The data supports one, and the per-module "assumes
you know" list is what answers "am I ready for this?" — a whole-track diagram
is a different feature, and would want the capstone work in P3.2 to point at.
### [ ] P3.5 — Exercises for the JS (0 today) and RN (4 today) tracks
### [ ] P3.6 — Glossary + cross-track links

---

## Phase 4 — New tracks

Only after P2.5 and P2.6. Order by machinery reuse:
**Node.js** (WebContainers) → **Python** (Pyodide) → **GIS** (MapLibre component) → rest.
