/**
 * Loads raw files from the parent repo via the /raw/ endpoint,
 * which is configured in vite.config.ts as a middleware that
 * serves files without Vite transformation.
 */

import i18n from '@/i18n';

/**
 * Load guide content with language fallback.
 * Tries: arguments/chapters/{lang}/filename → arguments/chapters/filename (English default)
 */
export async function loadGuideContent(guideFile: string): Promise<string> {
  const lang = i18n.language;

  // If not English, try the localized version first
  if (lang !== 'en') {
    const localizedPath = guideFile.replace(
      'arguments/chapters/',
      `arguments/chapters/${lang}/`
    );
    const res = await fetch(`/raw/${localizedPath}`);
    if (res.ok) return res.text();
    // Fall back to English
  }

  const res = await fetch(`/raw/${guideFile}`);
  if (!res.ok) throw new Error(`Failed to load guide: ${guideFile}`);
  return res.text();
}

export async function loadExerciseStub(exerciseDir: string): Promise<string> {
  const res = await fetch(`/raw/${exerciseDir}/index.tsx`);
  if (!res.ok) throw new Error(`Failed to load exercise stub: ${exerciseDir}`);
  return res.text();
}

export async function loadTestFile(exerciseDir: string): Promise<string> {
  const res = await fetch(`/raw/${exerciseDir}/index.test.tsx`);
  if (!res.ok) throw new Error(`Failed to load test file: ${exerciseDir}`);
  return res.text();
}

export async function loadExerciseReadme(exerciseDir: string): Promise<string> {
  const res = await fetch(`/raw/${exerciseDir}/README.md`);
  if (!res.ok) throw new Error(`Failed to load README: ${exerciseDir}`);
  return res.text();
}
