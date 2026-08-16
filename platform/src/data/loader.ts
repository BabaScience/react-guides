/**
 * Loads raw files from the parent repo via the /raw/ endpoint.
 *
 * In dev the endpoint is a Vite middleware (see vite.config.ts); in production
 * the files are copied into public/raw/ by scripts/copy-content.js and served
 * statically.
 *
 * IMPORTANT: a 200 response is not proof the file exists. Both the dev server
 * and `vite preview` fall back to index.html for unknown paths, so a missing
 * file arrives as `200 text/html`. Trusting `res.ok` alone is what made the
 * localized→English fallback silently fail and render an HTML document as
 * markdown. Every fetch below goes through `fetchText`, which rejects that.
 */

import i18n from '@/i18n';

/** Response bodies that are really the SPA shell, not the file we asked for. */
function looksLikeHtmlShell(body: string, contentType: string | null): boolean {
  if (contentType && contentType.includes('text/html')) return true;
  const head = body.slice(0, 200).trimStart().toLowerCase();
  return head.startsWith('<!doctype html') || head.startsWith('<html');
}

/**
 * Fetch a raw file as text. Resolves to `null` when the file is absent —
 * whether the server says 404 or hands back the SPA shell with a 200.
 */
async function fetchTextOrNull(path: string): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(`/raw/${path}`);
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const body = await res.text();
  if (looksLikeHtmlShell(body, res.headers.get('content-type'))) return null;
  return body;
}

async function fetchText(path: string, what: string): Promise<string> {
  const body = await fetchTextOrNull(path);
  if (body === null) throw new Error(`Failed to load ${what}: ${path}`);
  return body;
}

function localizedPath(guideFile: string, lang: string): string {
  return guideFile.replace('arguments/chapters/', `arguments/chapters/${lang}/`);
}

export interface GuideContent {
  /** The chapter in the active language — falls back to English when absent. */
  localized: string;
  /**
   * The English chapter. Section lookup is ordinal: we find a step's heading in
   * the English chapter and take the same position from the localized one, so
   * translated H2 text never breaks the lookup. See section-extractor.ts.
   */
  english: string;
  /** True when no translation existed and `localized === english`. */
  usedFallback: boolean;
}

export async function loadGuide(guideFile: string): Promise<GuideContent> {
  const lang = i18n.language;
  const english = await fetchText(guideFile, 'guide');

  if (lang === 'en') return { localized: english, english, usedFallback: false };

  const localized = await fetchTextOrNull(localizedPath(guideFile, lang));
  return localized === null
    ? { localized: english, english, usedFallback: true }
    : { localized, english, usedFallback: false };
}

/** Whole-chapter content in the active language (legacy full-guide route). */
export async function loadGuideContent(guideFile: string): Promise<string> {
  const { localized } = await loadGuide(guideFile);
  return localized;
}

export function loadExerciseStub(exerciseDir: string): Promise<string> {
  return fetchText(`${exerciseDir}/index.tsx`, 'exercise stub');
}

export function loadTestFile(exerciseDir: string): Promise<string> {
  return fetchText(`${exerciseDir}/index.test.tsx`, 'test file');
}

export function loadExerciseReadme(exerciseDir: string): Promise<string> {
  return fetchText(`${exerciseDir}/README.md`, 'README');
}

/**
 * The module's reference solutions, in the same `// EXERCISE N:` layout as the
 * stub — so `buildExerciseCode` splits it with no extra parsing.
 *
 * Only call this when `module.hasSolutions` is true. Existence is a build-time
 * fact recorded in the manifest, not something to discover by fetching.
 */
export function loadExerciseSolution(exerciseDir: string): Promise<string> {
  return fetchText(`${exerciseDir}/solution.tsx`, 'reference solution');
}
