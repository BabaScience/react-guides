/**
 * Extracts sections from a markdown guide by splitting on ## headings.
 * Returns a map of heading text → section content (including the heading itself).
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
      // Save previous section
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

  // Don't forget last section
  if (currentHeading) {
    sections.push({
      heading: currentHeading,
      content: currentLines.join('\n').trim(),
    });
  }

  return sections;
}

/**
 * Find a section by a partial heading match.
 *
 * `sectionHeading` from the step config is always in English (e.g. `"9. Custom
 * Hooks"`), but the markdown we're scanning may be a localized chapter whose
 * H2s have been translated (e.g. `"9. Custom Hook"` in Italian, `"9. Hooks
 * personnalisés"` in French). We work through progressively looser strategies:
 *
 *   1. exact heading match
 *   2. prefix match (heading starts with lookup)
 *   3. case-insensitive substring match
 *   4. leading-number match — translated headings reliably keep the `N.`
 *      numbering even when the title text changes, so as a final fallback we
 *      match `"9. Custom Hooks"` against any H2 starting with `"9."`.
 */
export function findSection(
  sections: MarkdownSection[],
  sectionHeading: string
): MarkdownSection | undefined {
  // 1. Try exact match
  const exact = sections.find((s) => s.heading === sectionHeading);
  if (exact) return exact;

  // 2. Try prefix match (e.g. "1. Understanding React" matches "1. Understanding React: What It Is...")
  const prefix = sections.find((s) => s.heading.startsWith(sectionHeading));
  if (prefix) return prefix;

  // 3. Try contains match
  const contains = sections.find((s) =>
    s.heading.toLowerCase().includes(sectionHeading.toLowerCase())
  );
  if (contains) return contains;

  // 4. Leading-number fallback for translated headings.
  const numMatch = sectionHeading.match(/^(\d+)\./);
  if (numMatch) {
    const numPrefix = `${numMatch[1]}.`;
    return sections.find((s) => s.heading.startsWith(numPrefix));
  }

  return undefined;
}
