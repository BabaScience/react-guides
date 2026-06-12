---
name: frontend-design
description: Apply this project's "Paper & ink" design system whenever creating or modifying UI in the learning platform (platform/src). Trigger for ANY work that touches JSX markup, Tailwind classes, components, pages, layout, colors, typography, buttons, badges, cards, or theming. Also trigger when asked to "improve the UI", restyle a page, or build a new screen/component.
---

# Frontend Design — "Paper & Ink"

You are working on the learning platform in `platform/`. All UI follows the **Paper & ink** design system (warm editorial light, Stripe/Notion lineage). The authoritative spec is `platform/DESIGN_SYSTEM.md`; a living rendered version is at `/styleguide` in the running app. This skill is the operational checklist — when in doubt, open the spec.

## Non-negotiables (check every change against these)

1. **Light-first, dark always.** Design/verify light mode first; every color class MUST have a `dark:` twin in the same edit. Dark mode is a warm "ink" near-black, never cool gray.
2. **Warm neutrals only.** Write `gray-*` classes as usual — the Tailwind config remaps `gray` → `stone`. Never import or hardcode cool grays (`slate`, `zinc`, `neutral`, raw hex grays).
3. **One accent.** `primary-*` (remapped to indigo) is the only interactive accent. Track identity (JS/React/RN) appears ONLY as small tinted chips — never as page theming.
4. **Pills for actions, rectangles for content.** Buttons, chips, badges = `rounded-full`. Cards = `rounded-xl`. List rows, dropdowns, code frames = `rounded-lg`.
5. **Serif display, sans everything else.** `font-display` (Georgia) on page titles and lesson h1/h2 only — normal weight, never bold. Never serif in body text, buttons, or navigation.
6. **Soft elevation.** Cards: `shadow-sm dark:shadow-none`. Floating menus: `shadow-lg`. Nothing else casts a shadow.
7. **Semantic color = meaning.** emerald = success/complete, amber = current/attention, red = error. Never decorative.
8. **Focus rings are mandatory** on interactive elements: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950`.

## Use the primitives

Shared primitives in `platform/src/components/ui/` (`Button`, `Badge`, `Card`) implement the recipes. For **new** components, compose from them — never hand-roll button/badge/card markup. Variants:

- `Button`: `primary` (ink pill — main CTA), `accent` (indigo), `success` (emerald, e.g. Run Tests), `secondary` (bordered), `ghost`. Sizes `sm|md|lg`.
- `Badge`: `neutral|success|info|warning` + track tones `js|react|native`.
- `Card`: `default|interactive|success|muted`.

If a needed variant doesn't exist: add it to the primitive **and** `DESIGN_SYSTEM.md` **and** the `/styleguide` page in the same change.

## Quick recipes (for non-primitive markup)

- Ink CTA (Link styled as button): `px-5 py-2 text-sm rounded-full font-medium transition-colors bg-gray-900 hover:bg-gray-700 text-white dark:bg-gray-100 dark:hover:bg-gray-300 dark:text-gray-900`
- Page title: `font-display text-3xl text-gray-900 dark:text-white`
- Muted description: `text-sm text-gray-500 dark:text-gray-400`
- Card surface: `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm dark:shadow-none p-5`
- Semantic surface: `border-{hue}-200 dark:border-{hue}-800/50 bg-{hue}-50 dark:bg-{hue}-950/20 text-{hue}-700 dark:text-{hue}-400`
- Track chips: js → `bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`; react → sky; native → violet (same shape)
- Dark translucency ladder — ONLY `/20` (tints), `/30` (washes), `/50` (surfaces), `/80` (toolbars). Never invent other steps.
- Spacing steps: 1, 1.5, 2, 3, 4, 5, 6, 8 only. Buttons `px-5 py-2` (lg) / `px-3.5 py-1.5` (md). Cards `p-5`. Pages `px-6 py-8`, `max-w-3xl` (reading) or `max-w-6xl` (dashboard).
- Text floor: nothing below `text-[10px]`, and that size is for chip labels only.

## Gotchas specific to this codebase

- **Tailwind can't see dynamic class names.** Never build classes with template literals (`bg-${color}-500`); always write full literal class strings.
- **`tailwind.config.ts` changes require a dev-server restart** — HMR will not pick them up and you'll chase ghosts.
- **Two theme defaults exist** and must stay in sync: `ui-store.ts` (`theme: 'light'`) and the boot fallback in `main.tsx`. Both are `'light'`.
- Shiki code blocks keep their dark IDE frame in light mode — intentional "ink islands"; don't restyle them.
- Module icons/emoji per track live in `ModuleCard.tsx` maps; track switcher config in `Sidebar.tsx` + `ProgressDashboard.tsx`.

## Definition of done for any UI change

1. `npx tsc --noEmit` clean.
2. Verified in the browser (preview tools) in **light mode first, then dark** — both must look intentional.
3. New patterns documented in `DESIGN_SYSTEM.md` + rendered on `/styleguide`.
4. No cool grays, no off-ladder opacities, no shadows outside cards/menus, no serif outside display headings, no missing `dark:` variants.
