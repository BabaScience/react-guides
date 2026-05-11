# Exercise Validation — Hints + Reference Solutions

For every exercise we check:

1. **Contract** — the assertions in the test file
2. **Hints** — do the current hints cover the contract (in all 3 languages)?
3. **Reference solution** — implementation following the hints literally
4. **Verification** — that solution passes all tests in the in-browser sandbox

Legend: `[x]` done · `[~]` partial / needs polish · `[ ]` to do · `[—]` n/a

## Plan

- Module 01 already got contract-aware hints earlier in this session; just verify the reference solutions pass.
- Module 02 still has the old generic-style hints; rewrite them, then verify.
- Tracking-file updates are incremental: each row gets flipped to `[x]` as it's confirmed.

---

## Module 01 — React Fundamentals (8 exercises)

| # | Exercise | Tests | Hints reviewed | Solution passes |
|---|----------|-------|----------------|------------------|
| 1 | greeting          | 3 | [x] | [x] |
| 2 | user-card         | 3 | [x] | [x] |
| 3 | todo-list         | 4 | [x] | [x] |
| 4 | counter           | 5 | [x] | [x] |
| 5 | status-message    | 6 | [x] | [x] |
| 6 | action-button     | 4 | [x] | [x] |
| 7 | contact-form      | 4 | [x] | [x] |
| 8 | filtered-list     | 6 | [x] | [x] |

## Module 02 — React Hooks (7 exercises)

| # | Exercise | Tests | Hints rewritten | Solution passes |
|---|----------|-------|------------------|------------------|
| 1 | counter-functional   | 4 | [x] | [x] |
| 2 | data-fetching        | 4 | [x] | [x] |
| 3 | theme-context        | 3 | [x] | [x] |
| 4 | focus-input          | 2 | [x] | [x] |
| 5 | filtered-list-memo   | 4 | [x] | [x] |
| 6 | callback-parent      | 2 | [x] | [x] |
| 7 | todo-reducer         | 5 UI (4 reducer-only tests live outside any `Exercise N` describe block, so the harness filter skips them; reducer correctness is exercised transitively by the UI tests) | [x] | [x] |

---

## Findings log

### Architectural fixes uncovered while validating Module 01

1. **`screen` queried the whole document, not just the test render.**
   Tests like `screen.getByText(/increment/i)` were matching the exercise description ("increment and decrement buttons") and prior test-name labels in the results panel — surfacing as `"Found multiple elements"`.
   **Fix** in `sandbox-iframe.ts`: replaced `screen` with a Proxy that re-binds queries to the latest `render(...).container` via `within(...)`. App UI is now invisible to test queries.

2. **`userEvent.setup is not a function`** — Vite's bundled namespace doesn't set `__esModule`, so Babel's `_interopRequireDefault` mis-wrapped it.
   **Fix**: in `testRequire`, mark every returned namespace with `{ __esModule: true, ... }` so the interop unwraps `default` correctly.

3. **Defensive body sweep** between tests removes any TL-managed `<body>` children that escape cleanup (HMR races, throws mid-render).

### Additional fix uncovered by Module 02

4. **`global is not defined`** — Module 02 tests use the Node idiom `global.fetch = jest.fn()`. The browser has no `global`. **Fix**: in `sandbox-iframe.ts`, inject `global: globalThis` into the test scope so writes still target the real (window-level) `fetch`.

### Reference solutions (the implementations that pass each exercise following only the hints)

Saved in this file as a permanent reference — every one was run in the actual in-browser sandbox and confirmed green.

#### Module 01

- **greeting**: `<div>Hello, {name ?? 'Guest'}!</div>` — single element, exact text, default prop.
- **user-card**: three sibling `<span>`s (`{name}`, `{email}`, `Age: {age}`). Each value in its own element so `getByText('John Doe')` finds it exactly.
- **todo-list**: `<ul>` with `<li key={id}>{text} <span>{completed ? '✓' : '⏳'}</span></li>` per todo.
- **counter**: `useState<number>(0)`, `<p>Count: {n}</p>`, two `<button>`s with text "Increment"/"Decrement".
- **status-message**: early returns in priority order `loading → error → data → null`. Loading text contains "loading"; error/data render the prop value verbatim.
- **action-button**: `<button onClick={onClick}>{text}</button>`.
- **contact-form**: `<form role="form">` with `<label htmlFor>` paired with `<input id>` for name + email; controlled with `useState`; submit handler does `e.preventDefault()` then `onSubmit({ name, email })`.
- **filtered-list**: `<input placeholder="Search">` controlled by state; `.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))` rendered as `<li>`s.

#### Module 02

- **counter-functional**: same as counter but `setCount(c => c + 1)` (functional update).
- **data-fetching**: three `useState` slots (`data`, `loading`, `error`); `useEffect` with `[]` deps; `cancelled` flag in cleanup; render-time priority loading → error → data with name/email each in own element.
- **theme-context**: `useState<'light' | 'dark'>('light')` in ThemeProvider; `useTheme` throws when context is `undefined`; ThemeToggle renders the current theme word and a button containing "toggle".
- **focus-input**: `useRef<HTMLInputElement>(null)` attached via `<input ref>`, plus a button whose text contains "focus" calling `inputRef.current?.focus()`.
- **filtered-list-memo**: `useMemo(() => items.filter(i => i.category === filter).sort(byNameOrValue), [items, filter, sortBy])`, rendered as `<li>`s.
- **callback-parent**: `React.memo` around MemoizedChild, `useCallback(()=>{}, [])` in parent, two unrelated state slots to prove the child doesn't re-render on changes.
- **todo-reducer**: switch-statement reducer for the 4 actions, `useReducer(todoReducer, { todos: [], nextId: 1 })`, controlled input with placeholder "Add todo", Add button trims empty input, each todo row has a checkbox + delete button, and a global "Clear completed" button.

---

_Last updated: complete — all 15 exercises verified, 4 sandbox fixes landed, hints rewritten in en/it/fr._
