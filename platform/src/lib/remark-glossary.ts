import type { GlossaryTerm } from '@/types/exercise';

/**
 * A remark plugin that links glossary terms the first time each appears in a
 * lesson's prose.
 *
 * It works on the mdast, not on the markdown text, and that is the whole
 * safety argument: `code` (fences) and `inlineCode` (backticks) are their own
 * node types, so a term inside an example or a `useState` reference is never
 * reachable by this walk. A regex over the raw source would have to re-derive
 * that, and would eventually get it wrong inside a fenced block.
 *
 * Three further limits, each there to stop the links becoming noise:
 *
 *   - only terms with `autolink: true` — "state" and "key" are ordinary words;
 *   - once per document per term, on first appearance;
 *   - never inside a heading or an existing link, and never a term the current
 *     module is itself the defining home for, which would link a reader to the
 *     page they are already reading.
 */

interface MdastNode {
  type: string;
  value?: string;
  url?: string;
  children?: MdastNode[];
  data?: Record<string, unknown>;
}

/** Node types whose subtree must be left alone. */
const OPAQUE = new Set(['code', 'inlineCode', 'link', 'linkReference', 'heading', 'image']);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function remarkGlossary(terms: GlossaryTerm[], lang: string, currentModuleId?: string) {
  const candidates = terms
    .filter((t) => t.autolink && t.definedIn !== currentModuleId)
    .map((t) => {
      const display = t.term[lang] ?? t.term.en;
      // Match on the term without a trailing gloss: the French entry for
      // `closure` displays as "Fermeture (closure)", and that literal string
      // never appears in prose — "fermeture" does.
      return { id: t.id, text: display.replace(/\s*\([^)]*\)\s*$/, '') };
    })
    // Longest first, so "higher-order component" wins over "component" when
    // both are candidates and their spans overlap.
    .sort((a, b) => b.text.length - a.text.length);

  return () => (tree: MdastNode) => {
    if (!candidates.length) return;
    const used = new Set<string>();

    const walk = (node: MdastNode) => {
      if (!node.children) return;

      const next: MdastNode[] = [];
      for (const child of node.children) {
        if (OPAQUE.has(child.type)) {
          next.push(child);
          continue;
        }
        if (child.type !== 'text' || !child.value) {
          walk(child);
          next.push(child);
          continue;
        }

        // Try each unused term against this text node, first match wins.
        const term = candidates.find(
          (c) => !used.has(c.id) && new RegExp(`\\b${escapeRe(c.text)}\\b`, 'i').test(child.value!)
        );
        if (!term) {
          next.push(child);
          continue;
        }

        const match = new RegExp(`\\b${escapeRe(term.text)}\\b`, 'i').exec(child.value);
        if (!match) {
          next.push(child);
          continue;
        }
        used.add(term.id);

        const before = child.value.slice(0, match.index);
        const hit = child.value.slice(match.index, match.index + match[0].length);
        const after = child.value.slice(match.index + match[0].length);

        if (before) next.push({ type: 'text', value: before });
        // The `/glossary#` prefix is the marker MarkdownRenderer styles on. An
        // earlier version tagged the node with `data.hProperties`, which does
        // not survive to the component's props in react-markdown 9 — the href
        // is both simpler and impossible to lose.
        next.push({
          type: 'link',
          url: `/glossary#${term.id}`,
          children: [{ type: 'text', value: hit }],
        });
        if (after) next.push({ type: 'text', value: after });
      }
      node.children = next;
    };

    walk(tree);
  };
}
