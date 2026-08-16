import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      // React's production build ships an `act()` that throws, and
      // @testing-library/react v14 calls `testUtils.act` on every render — so
      // under a prod bundle every test run through the *in-page* runner fails.
      // We rewrite TL's `domAct` to a pass-through.
      //
      // This only matters for `test-runner.ts`, the fallback path used by specs
      // that drive `user-event` (see runners/react-browser.ts). The isolated
      // frame carries its own development React, where `act` works properly and
      // needs no patching — and the frame is built by vite.sandbox.config.ts,
      // which deliberately does not include this plugin.
      //
      // Pass-through and nothing more, on purpose. Two earlier versions tried
      // to make the stub flush React's work itself:
      //
      //   `cb(); flushSync(() => {})`  — never commits a `root.render()`,
      //      because that render is scheduled on the default lane and a
      //      separate empty flush does not pick it up.
      //   `flushSync(() => cb())`      — commits the render, but then every
      //      user-event dispatch also runs inside a sync flush, which defeats
      //      React's own discrete-event flushing.
      //
      // The only thing that genuinely needs a flush is the initial `render()`,
      // and that is wrapped where it belongs — in the runner's interceptor.
      name: 'patch-testing-library-act',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('@testing-library/react') && id.endsWith('.esm.js')) {
          const patched = code.replace(
            /const\s+domAct\s*=\s*testUtils\.act\s*;?/,
            `const domAct = (cb) => cb();`
          );
          if (patched !== code) return patched;
        }
        return null;
      },
    },
    {
      // Serves chapter markdown and exercise files to the running app in dev.
      // In production the same files are copied into public/raw/ by
      // scripts/copy-content.js and served as static assets.
      //
      // This middleware bypasses Vite's own `server.fs` restrictions, so it
      // needs its own. Previously it resolved any path under the repo root,
      // which meant `GET /raw/.git/config` returned the repository's remote URL
      // and `/raw/.env` would have returned secrets. Only the directories the
      // app actually reads from are reachable now.
      name: 'raw-file-server',
      configureServer(server) {
        const repoRoot = path.resolve(__dirname, '..');

        /** Prefixes (relative to the repo root) the app is allowed to read. */
        const ALLOWED_PREFIXES = [
          'arguments/chapters',
          'src',
          // React/ReactDOM .d.ts files, fetched to feed Monaco's autocomplete.
          'platform/node_modules/@types/react',
          'platform/node_modules/@types/react-dom',
        ];

        const ALLOWED_EXTENSIONS = new Set([
          '.md',
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.json',
          '.css',
        ]);

        const MIME_TYPES: Record<string, string> = {
          '.json': 'application/json',
        };

        server.middlewares.use('/raw', (req, res, next) => {
          // Strip the query/hash and decode before resolving, so an encoded
          // `%2e%2e` cannot smuggle a traversal past the prefix check below.
          let requestPath: string;
          try {
            requestPath = decodeURIComponent((req.url ?? '').split(/[?#]/)[0]);
          } catch {
            return next();
          }

          const filePath = path.resolve(repoRoot, `.${requestPath}`);
          const relative = path.relative(repoRoot, filePath).split(path.sep).join('/');

          const escapesRoot = relative.startsWith('..') || path.isAbsolute(relative);
          const allowed = ALLOWED_PREFIXES.some(
            (prefix) => relative === prefix || relative.startsWith(`${prefix}/`)
          );
          if (escapesRoot || !allowed) return next();

          const ext = path.extname(filePath);
          if (!ALLOWED_EXTENSIONS.has(ext)) return next();

          if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return next();

          res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'text/plain; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(fs.readFileSync(filePath, 'utf-8'));
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react-native': 'react-native-web',
    },
  },
  optimizeDeps: {
    // src/monaco-setup.ts imports `editor.api.js` and the TypeScript language
    // contribution as separate subpaths. Pre-bundling them into independent
    // optimized chunks yields two copies of the API module, so the namespace
    // the contribution is attached to is not the one the editor receives.
    exclude: ['monaco-editor'],
  },
  server: {
    port: 3000,
    fs: {
      allow: ['..'],
    },
  },
});
