# Design System — "Paper & Ink" (v2)

> The single source of truth for all UI decisions in this platform. Every new component and every UI improvement must follow this guide. If something here doesn't cover your case, extend this document first, then build.

A living, rendered version of this guide is available in the app at **`/styleguide`**.

**Direction:** warm editorial light — Stripe/Notion lineage. Paper backgrounds, ink text, serif display headings, pill-shaped actions, one indigo accent. Light is the primary theme; dark mode is a warm "ink" night mode, not the default.

---

## 1. Design Principles

1. **Reading comes first.** This platform is mostly long-form lessons. Warm paper backgrounds, generous whitespace, and a serif display voice make long sessions comfortable. Chrome stays quiet so content carries the page.
2. **Light-first, ink-dark second.** Design and verify in light mode first. Dark mode is a warm near-black ("ink") counterpart — required on every element, but it follows the light design, never leads it.
3. **Warm neutrals only.** All grays are the *stone* scale (warm). Cool blue-grays are gone; never reintroduce them.
4. **One accent.** Indigo is the only interactive accent. Per-track identity lives in small tinted chips (§2.4) and never spreads beyond them.
5. **Semantic color = meaning.** Emerald = done/passing. Amber = current/attention. Red = error. Never decorative.
6. **Soft elevation.** Cards may carry a soft `shadow-sm`; floating menus `shadow-lg`. Nothing heavier — elevation whispers.

---

## 2. Color Tokens

### 2.1 Token-level remaps (tailwind.config.ts)

- `gray-*` **is** Tailwind `stone` (warm). Components keep writing `gray-…`.
- `primary-*` **is** indigo.
- `font-display` = Georgia serif stack.

### 2.2 Primary (accent) — indigo

| Token | Hex | Use |
|---|---|---|
| `primary-50` | `#eef2ff` | Active item tint (light) |
| `primary-100` | `#e0e7ff` | Active nav/track background (light) |
| `primary-300` | `#a5b4fc` | Hover borders (light) |
| `primary-400` | `#818cf8` | Links, active text (dark) |
| `primary-500` | `#6366f1` | Progress bars, blockquote accents, focus rings |
| `primary-600` | `#4f46e5` | Links (light), accent buttons, `/20` tints (dark) |
| `primary-700` | `#4338ca` | Accent button hover, active text (light) |

`800–950` are reserved — never use for UI.

### 2.3 Neutrals — paper & ink roles (stone scale)

| Intent | Light mode | Dark mode |
|---|---|---|
| App background ("paper") | `bg-gray-50` | `bg-gray-950` |
| Content surface | `bg-white` | `bg-gray-900/50` |
| Panel / sidebar | `bg-gray-50` | `bg-gray-900` |
| Hover background | `bg-gray-100` | `bg-gray-800` |
| Border / divider | `border-gray-200` | `border-gray-800` |
| Strong border | `border-gray-300` | `border-gray-700` |
| Ink (primary text) | `text-gray-900` | `text-gray-100` |
| Secondary text | `text-gray-700` | `text-gray-300` |
| Muted text | `text-gray-500` | `text-gray-400` |
| Faint text | `text-gray-400` | `text-gray-500` |

### 2.4 Track chips

Per-track identity is a tinted pill — nowhere else:

| Track | Recipe |
|---|---|
| JavaScript | `bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300` |
| React | `bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300` |
| React Native | `bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300` |

Tracks do **not** get their own page themes — indigo stays the only interactive accent.

### 2.5 Semantic colors

Same trio as v1: `emerald` (success/complete), `amber` (attention/current), `red` (error). Surface recipe:

```
border-{hue}-200 dark:border-{hue}-800/50
bg-{hue}-50     dark:bg-{hue}-950/20
text-{hue}-700  dark:text-{hue}-400
```

### 2.6 Dark-mode opacity ladder

Unchanged and still locked to four steps: `/20` tint · `/30` wash · `/50` surface · `/80` solid-ish.

---

## 3. Typography

Body: system sans. **Display: `font-display` (Georgia serif)** — the editorial voice.

| Token | Use |
|---|---|
| `font-display text-3xl text-gray-900 dark:text-white` | Page titles, lesson h1 (serif, normal weight — serif carries the authority, not boldness) |
| `font-display text-2xl` | Section titles, lesson h2 (with `pb-2 border-b`) |
| `text-xl font-semibold` (sans) | Lesson h3 |
| `text-lg font-semibold` (sans) | Lesson h4, card titles |
| `text-sm` | Default UI body — buttons, nav, descriptions |
| `text-sm leading-relaxed` | Lesson paragraphs |
| `text-xs` | Metadata, badges, dense toolbars |
| `text-[10px]` | Chip labels only. Nothing smaller. |

Rules: serif (`font-display`) is for h1/h2 display moments only — never body text, never buttons. Weights: sans uses `medium/semibold`; serif headings stay normal weight (Georgia bold reads heavy). No `font-light`/`font-thin`.

Code styles are unchanged from v1 (inline code keeps `text-primary-600 dark:text-primary-400`; Shiki blocks untouched — dark code frames are intentional "ink islands" on paper).

---

## 4. Spacing

Unchanged from v1 — 4px grid, steps **1, 1.5, 2, 3, 4, 5, 6, 8**, same recipes (`px-4 py-2` buttons, `p-5` cards, `px-6 py-8` pages, `max-w-3xl` reading / `max-w-6xl` dashboards). Editorial generosity comes from the type scale and paper tones, not from inflating the grid.

---

## 5. Shape

**Pills for actions, rounded rectangles for content.**

| Radius | Use |
|---|---|
| `rounded-full` | **Buttons, track chips, badges**, progress bars, timeline dots |
| `rounded-xl` | Cards |
| `rounded-lg` | List rows, dropdowns, code frames, semantic surfaces |
| `rounded` / `rounded-md` | Inline kbd, tiny technical chips |

**Borders:** 1px (`border`), warm via stone. Keep v1 exceptions (`border-2` timeline dots, `border-l-4 border-primary-500` blockquotes, `border-dashed` hint boxes).

**Shadows (revised):** `shadow-sm` allowed on raised cards; `shadow-lg` on floating menus. Nothing else — no colored or large shadows.

---

## 6. Interaction

### 6.1 Transitions — unchanged (`transition-colors` default; `transition-all duration-200` for layout; `opacity-0 group-hover:opacity-100` reveals).

### 6.2 Hover recipes

| Element | Hover |
|---|---|
| Ghost button / nav item | `hover:bg-gray-100 dark:hover:bg-gray-800` + text to ink |
| Ink button (primary) | `bg-gray-900 → hover:bg-gray-700` (light); inverted paper-on-ink in dark |
| Accent/success solid | background one step darker |
| Card | `hover:border-primary-300 dark:hover:border-primary-500/50` + `hover:shadow-sm` |
| Link | `text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline` |

### 6.3 Focus — unchanged, required: `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950` (built into `Button`).

Two cases the plain recipe doesn't cover:

- **Inside a bordered strip** (tab bars, toolbars) an offset ring is clipped — use
  `focus-visible:ring-inset` and drop the offset.
- **Hover-revealed controls** (`opacity-0 group-hover:opacity-100`) must also carry
  `focus-visible:opacity-100`, or a keyboard user tabs onto an invisible button.
  The code-block copy button is the reference case.

### 6.4 Disabled — unchanged (`disabled:opacity-50 disabled:cursor-not-allowed`).

### 6.5 Accessibility floor

Every change is held to these. They are cheap at authoring time and expensive to retrofit.

| Pattern | Requirement |
| --- | --- |
| Icon-only / emoji-only control | `aria-label` with real words; the glyph gets `aria-hidden="true"`. `title` alone is not enough. |
| Decorative emoji or glyph | `aria-hidden="true"` — including the `•` in lists and `▾ ▸` disclosure arrows. |
| Toggle (track switcher, filters) | `aria-pressed`, so state isn't conveyed by colour alone. |
| Disclosure (hints, props panel, menus) | `aria-expanded` + `aria-controls` pointing at a real `id`. |
| Dropdown menu | `aria-haspopup="menu"`, `role="menu"`, `role="menuitemradio"` + `aria-checked` for single-select. Must open on click/keyboard — **never hover-only**. |
| Tab strip | `role="tab"` + `aria-selected`. |
| Progress bar | `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax` and a label. |
| Landmarks | One `<main id="main-content">`; every `<nav>` carries `aria-label` (there are several). |
| Current page | `aria-current="page"` — `NavLink` supplies it; breadcrumbs set it by hand on the last crumb. |
| Skip link | First focusable element in `AppShell`; `sr-only` until focused. The sidebar is ~60 tab stops. |

**Language is not a flag.** Regional-indicator emoji don't render on Windows (the picker
read "FR FR"), and a flag names a country, not a language. Use the language code plus its
endonym — `EN / English`, `FR / Français`.

---

## 7. Component Recipes

Primitives live in `src/components/ui/` — use them. New variant = primitive + this doc + `/styleguide` in one PR.

### 7.1 Button (`ui/Button.tsx`) — pills

| Variant | Recipe | Use |
|---|---|---|
| `primary` | **Ink pill** — `bg-gray-900 hover:bg-gray-700 text-white dark:bg-gray-100 dark:hover:bg-gray-300 dark:text-gray-900` | Main CTA (Continue, Start Learning) |
| `accent` | `bg-primary-600 hover:bg-primary-700 text-white` | Secondary emphasis, links-as-buttons |
| `success` | `bg-emerald-600 hover:bg-emerald-700 text-white` | Run Tests, completion |
| `secondary` | `border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800` | Reset, Cancel |
| `ghost` | `text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white` | Toolbar/icon actions |

All `rounded-full font-medium transition-colors` + focus ring. Sizes unchanged: `sm` (`px-2.5 py-1 text-xs`), `md` (`px-3.5 py-1.5 text-xs`), `lg` (`px-5 py-2 text-sm`) — pills get slightly wider horizontal padding than v1.

### 7.2 Badge (`ui/Badge.tsx`) — pill chips

`text-[10px] px-2 py-0.5 rounded-full font-medium`. Tones: `neutral`, `success`, `info`, `warning` (v1 recipes) **plus track tones** `js`, `react`, `native` (§2.4).

### 7.3 Card (`ui/Card.tsx`)

Base: `rounded-xl border p-5 transition-all`. Tones:
- `default` — `border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm dark:shadow-none`
- `interactive` — default + hover border/`hover:shadow` per §6.2
- `success` / `muted` — unchanged from v1

### 7.4 Progress bar / 7.5 Timeline dot — unchanged from v1 (indigo fill now comes from the `primary` remap automatically).

### 7.6 Floating menu — `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg`.

---

## 8. Layout — unchanged from v1 (shell, `h-12` header, `w-64/w-16` sidebar, reading widths, `sm/lg/xl` breakpoints).

## 9. Theme Default

Light ("paper") is the default theme for new users. The toggle remains; dark mode ("ink") must stay first-class on every element.

## 10. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Compose from `Button`/`Badge`/`Card` | Hand-roll new color combos |
| Serif `font-display` for h1/h2 only | Serif body text or serif buttons |
| Track colors as chips only | Per-track page theming |
| `shadow-sm` cards, `shadow-lg` menus | Bigger/colored shadows |
| Pills for actions and chips | Pill-shaped cards or panels |
| Pair every color with `dark:` | Light-only styles |
| Stick to the `/20 /30 /50 /80` ladder | New opacity values |

## 11. Extending the System

1. Check `/styleguide` and `src/components/ui/` first.
2. Design additions as tokens/variants, not one-offs.
3. One PR = primitive + this doc + `/styleguide` updated together.

---

*v2 supersedes the v1 (cool-gray/blue, borders-over-shadows, rectangular buttons) system. The v1→v2 migration is mechanical for neutrals/accent (token remap) and intentional for shape (pills), type (serif display), and elevation (soft shadows).*
