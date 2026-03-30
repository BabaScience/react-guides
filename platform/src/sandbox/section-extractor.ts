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
 * The sectionHeading from the step config is matched against the start of the markdown heading.
 */
export function findSection(
  sections: MarkdownSection[],
  sectionHeading: string
): MarkdownSection | undefined {
  // Try exact match first
  const exact = sections.find((s) => s.heading === sectionHeading);
  if (exact) return exact;

  // Try prefix match (e.g. "1. Understanding React" matches "1. Understanding React: What It Is...")
  const prefix = sections.find((s) => s.heading.startsWith(sectionHeading));
  if (prefix) return prefix;

  // Try contains match
  return sections.find((s) =>
    s.heading.toLowerCase().includes(sectionHeading.toLowerCase())
  );
}
