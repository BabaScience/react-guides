/**
 * In-browser TypeScript/JSX transpilation using @babel/standalone.
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

  return result.code ?? '';
}

/**
 * Strip TypeScript-only syntax that Babel sometimes struggles with,
 * like `import type` and `export type`.
 */
export function preprocessTypeScript(code: string): string {
  return code
    .replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+type\s+\{[^}]*\};?/g, '')
    .replace(/export\s+type\s+\w+\s*=[^;]+;/g, '')
    .replace(/export\s+interface\s+\w+[^{]*\{[^}]*\}/g, '');
}
