import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      // React's production build ships an `act()` that throws
      // "act(...) is not supported in production builds of React." But
      // @testing-library/react v14 calls `testUtils.act` on every render
      // and fireEvent, so under a prod bundle every sandbox test fails.
      //
      // We patch TL's bundled source to swap its `testUtils.act` reference
      // for a pass-through stub. React 18's automatic batching handles
      // state-update flushing for the simple tests our sandbox runs, so a
      // no-op act is safe here. This only affects the in-browser test
      // runner — the app's own React is untouched.
      name: 'patch-testing-library-act',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('@testing-library/react') && id.endsWith('.esm.js')) {
          // Replace `testUtils.act` (which throws in production) with a
          // pass-through stub that flushes pending React work via
          // ReactDOM.flushSync. TL already imports `ReactDOM` from 'react-dom'
          // at the top of this file, so we can use it directly.
          //
          // Strategy: run cb() first (so any setState / fireEvent dispatch
          // happens normally), THEN call flushSync(() => {}) to drain any
          // pending state updates synchronously. This keeps the async path
          // clean — we don't wrap an async callback inside flushSync, which
          // is awkward — and lets each nested act call (e.g. one per
          // character in `user.type`) flush its own state update.
          const patched = code.replace(
            /const\s+domAct\s*=\s*testUtils\.act\s*;?/,
            `const domAct = (cb) => {
              const cbResult = cb();
              if (cbResult && typeof cbResult.then === "function") {
                // Async cb (e.g. user.type / user.click): each event
                // dispatch inside the promise chain also goes through this
                // stub (TL's eventWrapper === act), so its own state updates
                // are flushed there. After the outer promise settles, flush
                // one final time for any trailing effects.
                return Promise.resolve(cbResult).then((v) => {
                  ReactDOM.flushSync(() => {});
                  return v;
                });
              }
              // Sync cb (e.g. root.render, setState): drain pending work
              // before returning to the caller's assertions.
              ReactDOM.flushSync(() => {});
              return undefined;
            };`,
          );
          if (patched !== code) {
            return patched;
          }
        }
        return null;
      },
    },
    {
      name: 'raw-file-server',
      configureServer(server) {
        server.middlewares.use('/raw', (req, res, next) => {
          const filePath = path.resolve(__dirname, '..', req.url!.slice(1));
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const ext = path.extname(filePath);
            const mimeTypes: Record<string, string> = {
              '.tsx': 'text/plain',
              '.ts': 'text/plain',
              '.jsx': 'text/plain',
              '.js': 'text/plain',
              '.md': 'text/plain',
              '.json': 'application/json',
              '.css': 'text/plain',
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(content);
          } else {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    fs: {
      allow: ['..'],
    },
  },
});
