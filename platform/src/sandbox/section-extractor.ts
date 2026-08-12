/**
 * Splits a markdown guide into `## ` sections and resolves a step to one of them.
 */

export interface MarkdownSection {
  heading: string;
  content: string;
}

export function extractSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split('\n');
  const sections: MarkdownSection[] = [];

  let currentHeading = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          content: currentLines.join('\n').trim(),
        });
      }
      currentHeading = line.replace(/^## /, '').trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentHeading) {
    sections.push({
      heading: currentHeading,
      content: currentLines.join('\n').trim(),
    });
  }

  return sections;
}

/**
 * Position of a step's section within the English chapter.
 *
 * `step.sectionHeading` is always the English H2, verbatim.
 * `scripts/validate-content.mjs` fails the build if it doesn't match exactly,
 * so this is a lookup, not a search — no fuzzy fallbacks, no silent mismatches.
 */
export function findSectionIndex(
  englishSections: MarkdownSection[],
  sectionHeading: string
): number {
  return englishSections.findIndex((s) => s.heading === sectionHeading);
}

/**
 * Resolve a step to its section in the reader's language.
 *
 * Translated chapters translate their H2 text ("1. Styling Paradigms in React"
 * → "1. Paradigmes de styling dans React"), so matching on text can't work
 * across locales. Instead we find the heading's *ordinal* in the English
 * chapter and take the same ordinal from the localized one. The validator
 * guarantees translations keep every H2 in the same order, which is what makes
 * this exact rather than approximate.
 *
 * Returns `undefined` only if the heading is absent from the English chapter —
 * a content bug the validator catches before it can ship.
 */
export function findSection(
  englishSections: MarkdownSection[],
  localizedSections: MarkdownSection[],
  sectionHeading: string
): MarkdownSection | undefined {
  const index = findSectionIndex(englishSections, sectionHeading);
  if (index === -1) return undefined;
  // If a translation drifted out of shape, English is better than nothing.
  return localizedSections[index] ?? englishSections[index];
}
