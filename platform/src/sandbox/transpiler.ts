/**
 * In-browser TypeScript/JSX transpilation.
 *
 * Sucrase, not Babel. `@babel/standalone` is 2.98 MB (683 KB gzip) and had to
 * be downloaded before a learner could run their first test; Sucrase is a
 * fraction of that because it does exactly the job we need — strip types,
 * compile JSX, rewrite ESM imports to CommonJS — and nothing else. There is no
 * syntax downlevelling, which is fine: the code runs in the same modern browser
 * that is already running the app.
 *
 * The `imports` transform is what makes the output loadable by
 * `executeAsCommonJS` in test-runner.ts: it emits `require(...)` calls,
 * assigns to `exports.*`, and marks the module with `__esModule`.
 *
 * There is deliberately no pre-processing step. An earlier version stripped
 * `import type`, `export type` and `export interface` with regexes before
 * transpiling. Those patterns used `[^}]*` / `[^;]+`, so a nested brace or an
 * inner semicolon truncated the match and left dangling syntax behind — valid
 * learner code like
 *
 *   export interface Props { user: { name: string }; age: number }
 *
 * came out as a syntax error blamed on the learner. The TypeScript transform
 * handles all of it.
 */

let sucrasePromise: Promise<typeof import('sucrase')> | null = null;

function loadSucrase() {
  if (!sucrasePromise) {
    sucrasePromise = import('sucrase');
  }
  return sucrasePromise;
}

export async function transpile(code: string, filename = 'index.tsx'): Promise<string> {
  const { transform } = await loadSucrase();

  try {
    return transform(code, {
      filePath: filename,
      transforms: ['typescript', 'jsx', 'imports'],
      jsxRuntime: 'classic',
      production: true,
    }).code;
  } catch (e) {
    // Sucrase reports `Error: Error transforming <file>: <message> (line:col)`.
    // Surface just the useful part — the learner sees this text verbatim.
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(message.replace(/^Error transforming [^:]*: /, ''));
  }
}
