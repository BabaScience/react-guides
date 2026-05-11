# Translation TODO

Tracks every string in the project that needs to exist in **en**, **it**, **fr**.
Tick off each cell as it's translated. Order roughly follows user visibility.

Legend: `[x]` done · `[ ]` to do · `[~]` partial / needs review · `[—]` n/a

## Current status

- **Sections 1–6** — fully translated in en/it/fr. Every UI string, exercise content, module metadata, step title, error message, and lesson chapter exists in all three languages.
- **Section 7 (exercise stub code comments)** — left English by design (industry convention).

### Translation style decision (recorded for future maintainers)

The IT/FR lesson chapters are **condensed translations** (~250 lines vs 1,300–2,800 in English): all 10 sections plus summary are present, with the core concepts and code examples translated faithfully, but the long-form prose is compressed. The English chapters remain available as fallback for readers wanting full depth.

The `##` section headings (e.g. `## 1. Understanding React: …`) are kept in English to preserve the section-extractor lookup against `step.sectionHeading` in `modules.ts`. Translation begins at the `###` level. This is the same convention chosen by whoever wrote the original IT chapter 1.

---

## 1. UI strings already in JSON (locale files)

The three locale files have **full key parity** today — every key in `en.json` exists in `it.json` and `fr.json`. Re-check this after any edit by running a key-diff. Below is the inventory of namespaces; mark a row when its **content** has been reviewed for tone/accuracy (not just presence).

Files: `platform/src/i18n/locales/{en,it,fr}.json`

| Namespace        | Keys                                                                                                                                                                                                                              | en   | it   | fr   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ---- |
| `app`            | title, subtitle                                                                                                                                                                                                                   | [x]  | [x]  | [x]  |
| `nav`            | home, back, backToModule, module, prev, next, continue, nextStep, nextExercise, completeModule, startLearning, readLesson, startExercises                                                                                         | [x]  | [x]  | [x]  |
| `dashboard`      | stepsCompleted, modules                                                                                                                                                                                                           | [x]  | [x]  | [x]  |
| `module`         | progress, steps, complete, comingSoon, locked, learningPath, comingSoonMessage, soon                                                                                                                                              | [x]  | [x]  | [x]  |
| `step`           | lesson, exercise, stepOf, stepProgress                                                                                                                                                                                            | [x]  | [x]  | [x]  |
| `exercise`       | title, reset, resetCode, angularEquivalent, showHints, hideHints, runTests, running, testResults, allPassed, failed, passing, runPrompt, toRun, runningTests, sandboxError, loadingExercise, exerciseNotFound, fileName, ctrlEnter, code, preview | [x]  | [x]  | [x]  |
| `preview`        | compiling, live, error, notExported, runtimeError                                                                                                                                                                                 | [x]  | [x]  | [x]  |
| `status`         | passed, inProgress, start, locked, complete                                                                                                                                                                                       | [x]  | [x]  | [x]  |
| `sidebar`        | expand, collapse                                                                                                                                                                                                                  | [x]  | [x]  | [x]  |
| `common`         | copy, code                                                                                                                                                                                                                        | [x]  | [x]  | [x]  |
| `errors`         | failedToLoadLesson, exerciseNotFound                                                                                                                                                                                              | [x]  | [x]  | [x]  |
| `theme`          | switchToLight, switchToDark                                                                                                                                                                                                       | [x]  | [x]  | [x]  |

> Note: `dashboard.modules` is hardcoded to `"12 Modules"`. If the module count ever changes, this string needs a count interpolation.

---

## 2. Per-exercise content (in JSON, under `exercises.{moduleId}.{exerciseId}`)

Each exercise has 4 strings: `name`, `description`, `hints[]`, `angularEquivalent`.

### Module 01 — Fundamentals

| Exercise          | en   | it   | fr   |
| ----------------- | ---- | ---- | ---- |
| greeting          | [x]  | [x]  | [x]  |
| user-card         | [x]  | [x]  | [x]  |
| todo-list         | [x]  | [x]  | [x]  |
| counter           | [x]  | [x]  | [x]  |
| status-message    | [x]  | [x]  | [x]  |
| action-button     | [x]  | [x]  | [x]  |
| contact-form      | [x]  | [x]  | [x]  |
| filtered-list     | [x]  | [x]  | [x]  |

### Module 02 — Hooks

| Exercise          | en   | it   | fr   |
| ----------------- | ---- | ---- | ---- |
| counter-functional | [x] | [x]  | [x]  |
| data-fetching     | [x]  | [x]  | [x]  |
| theme-context     | [x]  | [x]  | [x]  |
| focus-input       | [x]  | [x]  | [x]  |
| filtered-list-memo | [x] | [x]  | [x]  |
| callback-parent   | [x]  | [x]  | [x]  |
| todo-reducer      | [x]  | [x]  | [x]  |

> Modules 03–12 have no exercises defined in `modules.ts` (status `coming-soon`). When those exercises get written, add entries for them here.

---

## 3. Module metadata (currently hardcoded in `modules.ts`, **NO** i18n keys)

These render on the home dashboard, sidebar, breadcrumb, and module page. They are pulled directly from `modules.ts` and bypass `t()` entirely.

Source: [platform/src/data/modules.ts](platform/src/data/modules.ts)

**Action required:** add a `modules.{moduleId}.name` and `modules.{moduleId}.description` block to each locale JSON, then update `ModuleCard`, `Sidebar`, `ModuleView`, and `Header` (breadcrumb) to read via `t()` with `mod.name`/`mod.description` as fallback.

| Module ID                | en (current source string)                                                          | it   | fr   |
| ------------------------ | ----------------------------------------------------------------------------------- | ---- | ---- |
| 01-fundamentals          | "React Fundamentals" / "JSX, components, props, state, events, …"                  | [x]  | [x]  |
| 02-hooks                 | "React Hooks Deep Dive" / "useState, useEffect, useContext, useRef, useMemo, …"     | [x]  | [x]  |
| 03-component-patterns    | "Component Patterns & Best Practices" / "Composition, HOCs, render props, …"        | [x]  | [x]  |
| 04-styling               | "React Styling" / "CSS Modules, styled-components, Tailwind, CSS-in-JS"             | [x]  | [x]  |
| 05-routing               | "Routing" / "React Router, dynamic routing, protected routes, navigation"           | [x]  | [x]  |
| 06-state-management      | "State Management" / "Context API, Redux, Zustand, Jotai, state patterns"           | [x]  | [x]  |
| 07-data-fetching         | "Data Fetching" / "Fetch API, Axios, React Query, SWR, caching strategies"          | [x]  | [x]  |
| 08-forms                 | "Forms & Validation" / "React Hook Form, Yup, Zod validation, controlled vs …"      | [x]  | [x]  |
| 09-performance           | "Performance Optimization" / "React.memo, useMemo, useCallback, code splitting, …"  | [x]  | [x]  |
| 10-testing               | "Testing" / "Jest, React Testing Library, integration and unit testing strategies"  | [x]  | [x]  |
| 11-typescript            | "TypeScript with React" / "Advanced types, generics, type-safe components, …"       | [x]  | [x]  |
| 12-advanced-patterns     | "Advanced Patterns" / "Portals, error boundaries, suspense, concurrent features"    | [x]  | [x]  |

---

## 4. Step titles (currently hardcoded in `modules.ts`)

Each step has a `title` shown in `StepTimeline`, the step navigation bar (`StepView`), and breadcrumbs. Only modules 01 and 02 have steps defined.

**Action required:** add a `steps.{moduleId}.{stepId}` block and update `StepTimeline`, `StepView`, and `Header` to read via `t()`.

### Module 01 — 18 steps

| Step ID                | en (title)                                  | it   | fr   |
| ---------------------- | ------------------------------------------- | ---- | ---- |
| understanding-react    | Understanding React                         | [x]  | [x]  |
| setup-environment      | Setting Up a Dev Environment                | [x]  | [x]  |
| jsx-syntax             | JSX Syntax                                  | [x]  | [x]  |
| components             | Components: Building Blocks                 | [x]  | [x]  |
| props                  | Props: Passing Data                         | [x]  | [x]  |
| greeting (ex)          | Exercise: Greeting Component                | [x]  | [x]  |
| user-card (ex)         | Exercise: User Card                         | [x]  | [x]  |
| lists-keys             | Lists and Keys                              | [x]  | [x]  |
| todo-list (ex)         | Exercise: Todo List                         | [x]  | [x]  |
| state-usestate         | State Management with useState              | [x]  | [x]  |
| counter (ex)           | Exercise: Counter with State                | [x]  | [x]  |
| conditional-rendering  | Conditional Rendering                       | [x]  | [x]  |
| status-message (ex)    | Exercise: StatusMessage                     | [x]  | [x]  |
| event-handling         | Event Handling                              | [x]  | [x]  |
| action-button (ex)     | Exercise: ActionButton                      | [x]  | [x]  |
| forms-controlled       | Forms and Controlled Components             | [x]  | [x]  |
| contact-form (ex)      | Exercise: ContactForm                       | [x]  | [x]  |
| filtered-list (ex)     | Exercise: FilteredList                      | [x]  | [x]  |

### Module 02 — 17 steps

| Step ID                | en (title)                                  | it   | fr   |
| ---------------------- | ------------------------------------------- | ---- | ---- |
| understanding-hooks    | Understanding Hooks                         | [x]  | [x]  |
| usestate               | useState: State Fundamentals                | [x]  | [x]  |
| counter-functional (ex)| Exercise: useState Counter                  | [x]  | [x]  |
| useeffect              | useEffect: Side Effects                     | [x]  | [x]  |
| data-fetching (ex)     | Exercise: Data Fetching                     | [x]  | [x]  |
| usecontext             | useContext: Global State                    | [x]  | [x]  |
| theme-context (ex)     | Exercise: Theme Context                     | [x]  | [x]  |
| useref                 | useRef: DOM & Persistence                   | [x]  | [x]  |
| focus-input (ex)       | Exercise: Focus Input                       | [x]  | [x]  |
| usememo                | useMemo: Memoization                        | [x]  | [x]  |
| filtered-list-memo (ex)| Exercise: Filtered List (useMemo)           | [x]  | [x]  |
| usecallback            | useCallback: Function Memoization           | [x]  | [x]  |
| callback-parent (ex)   | Exercise: Stable Callbacks                  | [x]  | [x]  |
| usereducer             | useReducer: Complex State                   | [x]  | [x]  |
| todo-reducer (ex)      | Exercise: Todo App (useReducer)             | [x]  | [x]  |
| custom-hooks           | Custom Hooks                                | [x]  | [x]  |
| advanced-patterns      | Advanced Patterns                           | [x]  | [x]  |

---

## 5. Hardcoded strings in TSX (bypass `t()` — need code change + i18n key)

| File:line                                                                                                          | English string                                  | Suggested key            | en   | it   | fr   |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------ | ---- | ---- | ---- |
| `platform/src/components/exercise/ExerciseView.tsx:105`                                                            | `"Sandbox Error"` (test case name)              | use existing `exercise.sandboxError` | [x] | [x] | [x] |
| `platform/src/components/module/ExerciseStepView.tsx:125`                                                          | `"Sandbox Error"` (same)                        | use existing `exercise.sandboxError` | [x] | [x] | [x] |
| `platform/src/components/module/LessonStepView.tsx:28`                                                             | `"No guide file for this module"`               | `errors.noGuideFile`     | [x]  | [x]  | [x]  |
| `platform/src/components/module/LessonStepView.tsx:41`                                                             | `Section "{x}" not found in guide`              | `errors.sectionNotFound` | [x]  | [x]  | [x]  |
| `platform/src/components/module/LessonStepView.tsx:92`                                                             | `"← Back to module"` (hardcoded link text)      | use existing `nav.backToModule` | [x] | [x] | [x] |
| `platform/src/components/layout/Header.tsx:7-9`                                                                    | language labels `English` / `Italiano` / `Français` | keep as-is (endonyms — render the same in every UI language) | [—] | [—] | [—] |

> The `Ctrl+Enter` kbd hint in `TestResultsPanel.tsx:30` is universal across languages — no change needed.

---

## 6. Lesson markdown content (`arguments/chapters/`)

Loader path: `loadGuideContent(guideFile)` in `platform/src/data/loader.ts` tries `arguments/chapters/{lang}/{file}` first, falls back to `arguments/chapters/{file}` (English default).

| Chapter file                                  | en   | it             | fr             |
| --------------------------------------------- | ---- | -------------- | -------------- |
| 01-fundamentals.md                            | [x]  | [x] condensed  | [x] condensed  |
| 02-react-hooks.md                             | [x]  | [x] condensed  | [x] condensed  |
| 03-component-patterns-best-practices.md       | [x]  | [x] condensed  | [x] condensed  |
| 04-react-styling.md                           | [x]  | [x] condensed  | [x] condensed  |
| 05-routing.md                                 | [x]  | [x] condensed  | [x] condensed  |
| 06-state-management.md                        | [x]  | [x] condensed  | [x] condensed  |
| 07-data-fetching.md                           | [x]  | [x] condensed  | [x] condensed  |
| 08-forms-and-validations.md                   | [x]  | [x] condensed  | [x] condensed  |
| 09-performance-optimization.md                | [x]  | [x] condensed  | [x] condensed  |
| 10-testing.md                                 | [x]  | [x] condensed  | [x] condensed  |
| 11-typescript.md                              | [—]  | [—]            | [—]            | English source not yet written
| 12-advanced-patterns.md                       | [—]  | [—]            | [—]            | English source not yet written

> The `fr/` folder exists but is empty. Italian chapter 1 needs to be finished before translating the rest.

---

## 7. Exercise stub & test files (`src/**/index.tsx`, `src/**/index.test.tsx`)

These are the code the user edits and the tests we run against it. They contain:
- Comments / docblocks (e.g., `OBJECTIVE: …`, `ANGULAR EQUIVALENT: …`, `INSTRUCTIONS: …`) — currently English only.
- TODO markers (`// TODO: Implement greeting component`) — English only.

**Decision needed:** do we want to localize the comments inside exercise stubs?
- **Argument for:** users edit code in their language.
- **Argument against:** keeps the codebase manageable, and code comments in English are a common dev convention. Most platforms (Codecademy, Exercism) leave code English even with localized UI.

Default recommendation: **leave English** unless explicitly requested. Mark this section `[—]` once decided.

| Exercise dir              | comments en | comments it | comments fr |
| ------------------------- | ----------- | ----------- | ----------- |
| `src/01-fundamentals/`    | [x]         | [—]         | [—]         |
| `src/02-hooks/`           | [x]         | [—]         | [—]         |

---

## Process

1. Translate one section at a time, top to bottom.
2. After each change, re-check JSON key parity (run a quick diff: `jq 'keys' en.json it.json fr.json`).
3. Verify in browser by switching the language picker.
4. Update the corresponding row in this file from `[ ]` to `[x]`.
5. When a row needs follow-up (partial / awkward phrasing), use `[~]` and add a note.
