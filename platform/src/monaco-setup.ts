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
// Import the package entry rather than cherry-picking
// `editor.api.js` + `monaco.contribution.js`. Vite pre-bundles those subpaths
// into separate optimized chunks, which yields two copies of the API module —
// the language contribution registers `languages.typescript` on one of them
// while `beforeMount` hands the editor the other, and reading
// `monaco.languages.typescript.typescriptDefaults` throws. The entry keeps
// everything in one module graph.
import * as monaco from 'monaco-editor';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

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
