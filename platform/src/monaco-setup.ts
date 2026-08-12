/**
 * Bundle Monaco locally instead of fetching it from a CDN at runtime.
 *
 * `@monaco-editor/react` defaults to loading the editor from
 * `cdn.jsdelivr.net` — thirteen script tags fetched on the first exercise
 * page. That made the CDN a hard runtime dependency of the *only* component
 * that makes exercises usable: no jsdelivr (offline, air-gapped machine,
 * corporate proxy, CDN outage) meant no editor, and there was no subresource
 * integrity on any of it.
 *
 * Handing `loader.config({ monaco })` a locally-imported instance stops the
 * network fetch entirely. We import the editor API plus only the TypeScript
 * language service — the `monaco-editor` barrel would also pull in ~80 basic
 * language grammars we never use.
 */

import { loader } from '@monaco-editor/react';
// Cherry-picked rather than the `monaco-editor` barrel: the barrel also drags
// in the CSS, HTML and JSON language services and their web workers — roughly
// 2 MB of build output for an editor that only ever opens .tsx files.
//
// The `.js` suffixes are required — monaco's package `exports` map is a literal
// `"./*": "./*"`, so extensionless subpaths don't resolve.
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

// Editor contributions: find/replace, folding, bracket matching, suggestions…
import 'monaco-editor/esm/vs/editor/editor.all.js';
// The TypeScript/JavaScript language service — diagnostics and completions.
import * as typescriptContribution from 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// The contribution only *exports* `typescriptDefaults` and friends — it does
// not attach them to the API. Normally `editor.main.js` does that
// (`monacoApi.languages.typescript = …`), but that is the barrel we are
// avoiding, so mirror the one line we need. Without it,
// `monaco.languages.typescript.typescriptDefaults` is undefined and CodeEditor
// throws on mount.
(monaco.languages as unknown as Record<string, unknown>).typescript =
  typescriptContribution;

declare global {
  interface Window {
    MonacoEnvironment?: monaco.Environment;
  }
}

window.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    return label === 'typescript' || label === 'javascript'
      ? new TsWorker()
      : new EditorWorker();
  },
};

loader.config({ monaco });

export { monaco };
