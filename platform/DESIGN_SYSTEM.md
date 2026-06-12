# Design System — Learning Platform

> The single source of truth for all UI decisions in this platform. Every new component and every UI improvement must follow this guide. If something here doesn't cover your case, extend this document first, then build.

A living, rendered version of this guide is available in the app at **`/styleguide`**.

---

## 1. Design Principles

1. **Content first.** This is a learning platform — lesson text and code are the heroes. Chrome (sidebars, headers, panels) stays quiet: muted grays, minimal shadows, thin borders.
2. **Borders over shadows.** Elevation is communicated with 1px borders and background shifts, not drop shadows. The only shadow allowed is `shadow-lg` on floating menus (dropdowns, popovers).
3. **Dark mode is not an afterthought.** Every color declaration ships with its `dark:` variant in the same commit. No exceptions.
4. **Semantic color = meaning, never decoration.** Emerald means "done/passing". Amber means "current/attention". Red means "error". Primary blue means "interactive/active". Don't use them for anything else.
5. **Motion is feedback, not flair.** `transition-colors` on everything interactive; nothing animates unless it responds to the user.

---

## 2. Color Tokens

### 2.1 Primary (brand) — blue

Defined in `tailwind.config.ts` under `theme.extend.colors.primary` (Tailwind blue scale).

| Token | Hex | Use |
|---|---|---|
| `primary-50` | `#eff6ff` | Active item background tint (light mode) |
| `primary-100` | `#dbeafe` | Active nav/track background (light mode) |
| `primary-300` | `#93c5fd` | Hover borders (light mode) |
| `primary-400` | `#60a5fa` | Links, active text (dark mode) |
| `primary-500` | `#3b82f6` | Progress bars, blockquote accents, spinners, focus rings |
| `primary-600` | `#2563eb` | Primary buttons, links (light mode), `/20` tints in dark mode |
| `primary-700` | `#1d4ed8` | Primary button hover, active text (light mode) |

**Rule:** interactive states use only `500/600/700` (light) and `400` + `600/20` tints (dark). Never use `800–950` for UI; they're reserved.

### 2.2 Neutrals — gray scale usage map

| Intent | Light mode | Dark mode |
|---|---|---|
| App background | `bg-gray-50` (body) / `bg-white` (content) | `bg-gray-950` |
| Panel / sidebar background | `bg-gray-50` | `bg-gray-900` |
| Raised surface (cards) | `bg-white` | `bg-gray-900/50` |
| Subtle surface (table heads, bars) | `bg-gray-50` | `bg-gray-900/50` or `bg-gray-800/50` |
| Hover background | `bg-gray-100` | `bg-gray-800` |
| Border / divider | `border-gray-200` | `border-gray-800` |
| Strong border (inputs, timeline dots) | `border-gray-300` | `border-gray-700` |
| Primary text | `text-gray-900` | `text-gray-100` or `text-white` (headings) |
| Secondary text | `text-gray-700` | `text-gray-300` |
| Muted text (descriptions, labels) | `text-gray-500` | `text-gray-400` |
| Faint text (timestamps, counters) | `text-gray-400` | `text-gray-500` |

### 2.3 Semantic colors

| Meaning | Scale | Canonical usages |
|---|---|---|
| **Success / complete / passing** | `emerald` | Completed steps, passed tests, progress-complete bars, "Run Tests" button |
| **Attention / current / not-passing-yet** | `amber` | Current lesson dot, failing-but-expected tests, warnings |
| **Error / destructive** | `red` | Runtime errors, sandbox failures, destructive confirmation |

Semantic surface recipe (same shape for all three, swap the hue):

```
border-{hue}-200 dark:border-{hue}-800/50
bg-{hue}-50     dark:bg-{hue}-950/20
text-{hue}-700  dark:text-{hue}-400  (or -300 for emphasis)
```

### 2.4 Dark-mode opacity ladder

Translucent dark backgrounds are locked to **four** steps. Do not invent new ones.

| Step | Value | Use |
|---|---|---|
| Tint | `/20` | Active-state tints (`bg-primary-600/20`), semantic surfaces (`bg-emerald-950/20`) |
| Wash | `/30` | Disabled/coming-soon card backgrounds |
| Surface | `/50` | Standard raised surfaces (cards, header bars) |
| Solid-ish | `/80` | Toolbars and hover states that must read as solid |

---

## 3. Typography

System font stack only (no webfonts). Monospace: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`.

### 3.1 Scale

| Token | Use |
|---|---|
| `text-3xl font-bold` | Page titles, lesson h1 |
| `text-2xl font-bold` | Section titles, lesson h2 (with `pb-2 border-b`) |
| `text-xl font-semibold` | Lesson h3 |
| `text-lg font-semibold` | Lesson h4, card titles |
| `text-sm` | **Default body for UI chrome** — buttons, nav, descriptions |
| `text-sm leading-relaxed` | Lesson body paragraphs |
| `text-xs` | Metadata, badges, button labels in dense toolbars |
| `text-[10px]` | Chip labels only (e.g. "Soon" badge). Nothing smaller. |

### 3.2 Weights

| Weight | Use |
|---|---|
| `font-bold` | h1/h2 only |
| `font-semibold` | h3/h4, card titles, emphasized inline text |
| `font-medium` | Nav items, buttons, badges, table headers |
| (normal) | Body text |

Never use `font-light` or `font-thin` — too faint on dark backgrounds.

### 3.3 Code

- Inline code: `bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded text-sm font-mono`
- Code blocks: Shiki-rendered inside the IDE-chrome frame (see `ShikiCode.tsx`); `0.85rem` / `1.5` line-height, never restyle inline.

---

## 4. Spacing

Tailwind's 4px grid, restricted to these steps: **1, 1.5, 2, 3, 4, 5, 6, 8** (= 4–32px).

| Pattern | Recipe |
|---|---|
| Dense toolbar button | `px-2 py-1` |
| Standard small button | `px-3 py-1.5` |
| Standard button | `px-4 py-2` |
| List row / nav item | `px-4 py-3` |
| Card padding | `p-5` |
| Panel/section padding | `p-4` |
| Page content | `px-6 py-8` with `max-w-3xl mx-auto` (reading) or `max-w-6xl` (dashboards) |
| Icon-to-label gap | `gap-1.5` or `gap-2` |
| Between cards/sections | `gap-4` |
| Heading top margins (markdown) | h1/h2 `mt-8`, h3 `mt-6`, h4 `mt-4` |

---

## 5. Shape

| Radius | Use |
|---|---|
| `rounded` | Tiny chips, inline kbd, copy buttons |
| `rounded-md` | Small buttons, "Soon" badges |
| `rounded-lg` | **Default.** Buttons, list rows, dropdowns, code frames, semantic surfaces |
| `rounded-xl` | Cards (module cards, panels that group content) |
| `rounded-full` | Progress bars, timeline dots, avatars, scrollbar |

**Borders:** 1px everywhere (`border`). Exceptions: `border-2` on timeline dots, `border-l-4 border-primary-500` on blockquotes, `border-dashed` on "escape hatch" hint boxes.

**Shadows:** only `shadow-lg` on floating overlays (dropdown menus). Nothing else.

---

## 6. Interaction

### 6.1 Transitions

- Color changes: `transition-colors` (default for every interactive element)
- Layout changes (sidebar collapse): `transition-all duration-200`
- Reveal on hover (copy buttons): `opacity-0 group-hover:opacity-100 transition-opacity`

### 6.2 Hover recipes

| Element | Hover |
|---|---|
| Ghost button / nav item | `hover:bg-gray-100 dark:hover:bg-gray-800` + text darkens to `gray-900`/`white` |
| Solid button | background one step darker (`bg-primary-600 → hover:bg-primary-700`) |
| Card | `hover:border-primary-300 dark:hover:border-primary-500/50` + `hover:bg-gray-50 dark:hover:bg-gray-900/80` |
| Link | `text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline` |

### 6.3 Focus (accessibility — required on new components)

All interactive elements must be focusable and show:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950
```

This is built into the shared `Button` primitive — use it instead of raw `<button>`.

### 6.4 Disabled

`disabled:opacity-50 disabled:cursor-not-allowed` on the shared primitives; solid buttons may also use `disabled:bg-gray-300 dark:disabled:bg-gray-700`.

---

## 7. Component Recipes

Shared primitives live in `src/components/ui/`. **Use them instead of hand-rolling.** If a variant is missing, add it to the primitive + this doc + the `/styleguide` page in the same PR.

### 7.1 Button (`ui/Button.tsx`)

| Variant | Recipe | Use |
|---|---|---|
| `primary` | `bg-primary-600 hover:bg-primary-700 text-white` | Main CTA (Start Learning, Continue) |
| `success` | `bg-emerald-600 hover:bg-emerald-700 text-white` | Run Tests, completion actions |
| `secondary` | `border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800` | Reset, Cancel |
| `ghost` | `text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white` | Icon buttons, toolbar actions |

Sizes: `sm` (`px-2 py-1 text-xs`), `md` (`px-3 py-1.5 text-xs`), `lg` (`px-4 py-2 text-sm`). All `rounded-lg font-medium transition-colors` + focus ring.

### 7.2 Badge (`ui/Badge.tsx`)

`text-[10px] px-1.5 py-0.5 rounded font-medium` with tones:
- `neutral` — `bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400` ("Soon")
- `success` — `bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300`
- `info` — `bg-primary-100 dark:bg-primary-600/20 text-primary-700 dark:text-primary-400` ("Exercise")
- `warning` — `bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300` ("Lesson", current)

### 7.3 Card (`ui/Card.tsx`)

Base: `rounded-xl border p-5 transition-all`. Tones:
- `default` — `border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50`
- `interactive` — default + card hover recipe (§6.2)
- `success` — emerald semantic surface
- `muted` — `bg-gray-50 dark:bg-gray-900/30 opacity-70 hover:opacity-90`

### 7.4 Progress bar

Track: `h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden` (h-1 in tight sidebars, h-2 on dashboards).
Fill: `h-full rounded-full transition-all` + `bg-primary-500` (in progress) or `bg-emerald-500` (complete).

### 7.5 Timeline dot (StepTimeline)

`w-7 h-7 rounded-full border-2 flex items-center justify-center`:
- complete → `bg-emerald-600 border-emerald-600 text-white`
- current lesson → `bg-amber-600/20 border-amber-500 text-amber-400`
- current exercise → `bg-primary-600/20 border-primary-500 text-primary-400`
- upcoming → `bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700`

### 7.6 Floating menu (dropdowns)

`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg` — the only shadow in the app.

---

## 8. Layout

- App shell: `h-screen flex` → fixed sidebar (`w-64`, collapsible to `w-16`) + `flex-1` column (header `h-12`, scrolling main).
- Reading width: `max-w-3xl mx-auto` for lessons; `max-w-6xl` for dashboards.
- Responsive grid for cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.
- Breakpoints: stick to `sm / lg / xl`. Don't introduce `md`/`2xl` without updating this doc.

---

## 9. Track Identity

| Track | Icon | Accent usage |
|---|---|---|
| JavaScript | 🟨 | Track switcher + dashboard title only |
| React | ⚛️ | idem |
| React Native | 📱 | idem |

Tracks do **not** get their own color themes — the primary blue stays constant across tracks. Identity is icon + title only. (Revisit deliberately if per-track theming is ever wanted; don't drift into it.)

---

## 10. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use the `Button`/`Badge`/`Card` primitives | Hand-roll `<button className="...">` with new color combos |
| Pair every color with a `dark:` variant | Ship light-mode-only styles |
| Use the 4-step dark opacity ladder (§2.4) | Invent `/35`, `/60`, `/75`… |
| Use emerald/amber/red for status meaning | Use them decoratively |
| Add new patterns to this doc + `/styleguide` first | Let a one-off component define a new pattern silently |
| `transition-colors` on everything clickable | `transition-all` on hover-only color changes |
| Keep shadows to floating overlays | Add card drop shadows |

---

## 11. Extending the System

When you need something this guide doesn't cover:

1. Check `/styleguide` and `src/components/ui/` — the variant may exist.
2. If not, design it **as a token/variant**, not a one-off: add it to the relevant primitive, document it here, render it on `/styleguide`.
3. One PR = code + doc + styleguide page updated together.
