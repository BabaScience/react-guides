/**
 * In-browser TypeScript/JSX transpilation using @babel/standalone.
 *
 * Note: there is deliberately no pre-processing step here. An earlier version
 * stripped `import type`, `export type` and `export interface` with regexes
 * before handing the source to Babel. Those patterns used `[^}]*` / `[^;]+`,
 * so any nested brace or inner semicolon truncated the match and left dangling
 * syntax behind — valid learner code like
 *
 *   export interface Props { user: { name: string }; age: number }
 *
 * came out as a syntax error blamed on the learner. Babel's TypeScript preset
 * handles every one of those constructs correctly on its own.
 */

let babelLoaded: Promise<typeof import('@babel/standalone')> | null = null;

function loadBabel() {
  if (!babelLoaded) {
    babelLoaded = import('@babel/standalone');
  }
  return babelLoaded;
}

export async function transpile(code: string, filename = 'index.tsx'): Promise<string> {
  const Babel = await loadBabel();

  const result = Babel.transform(code, {
    filename,
    presets: [
      ['env', { modules: 'commonjs', targets: { esmodules: true } }],
      ['typescript', { isTSX: true, allExtensions: true }],
      ['react', { runtime: 'classic' }],
    ],
    plugins: [],
  });

  if (result.code == null) {
    throw new Error(`Babel produced no output for ${filename}`);
  }
  return result.code;
}
