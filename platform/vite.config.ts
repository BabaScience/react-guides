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
      // for a stub built on ReactDOM.flushSync. This only affects the
      // in-browser test runner — the app's own React is untouched.
      //
      // The callback MUST run *inside* flushSync, not before it. An earlier
      // version did `cb(); flushSync(() => {})`, reasoning that the empty
      // flush would drain whatever cb() scheduled. It doesn't: `root.render()`
      // schedules at default (concurrent) lane, and a separate empty
      // `flushSync` does not commit it. The container was still empty when the
      // assertions ran, so *every rendering exercise failed in production* —
      // which is what the "Mark as completed manually" escape hatch in
      // progress-store.ts was built to work around.
      //
      // KNOWN LIMITATION: state updates driven by `@testing-library/user-event`
      // still do not commit under a production React build. Assertions on DOM
      // values pass (the browser types into the input for real), but a handler
      // reading component state sees the initial value — e.g. a form's
      // `onSubmit` receives `{ name: '', email: '' }` after `user.type`.
      // No arrangement of flushSync fixes this, because production React has no
      // working `act` to batch against. The real fix is to run the sandbox
      // against React's *development* build inside an isolated iframe, which is
      // PLAN.md P2.2 — the app's own production React cannot be swapped, but an
      // iframe gets its own copy.
      name: 'patch-testing-library-act',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('@testing-library/react') && id.endsWith('.esm.js')) {
          const patched = code.replace(
            /const\s+domAct\s*=\s*testUtils\.act\s*;?/,
            `const domAct = (cb) => {
              // An async callback (user.type / user.click) must NOT start
              // inside flushSync: its promise chain re-enters this stub for
              // every keystroke, and those nested flushes are swallowed. Branch
              // on the function kind, which is known before calling it.
              const flushAfter = (p) =>
                Promise.resolve(p).then((v) => {
                  ReactDOM.flushSync(() => {});
                  return v;
                });

              if (cb.constructor && cb.constructor.name === "AsyncFunction") {
                return flushAfter(cb());
              }

              let result;
              ReactDOM.flushSync(() => {
                result = cb();
              });
              if (result && typeof result.then === "function") {
                return flushAfter(result);
              }
              // Effects scheduled by the commit (useEffect) land in a passive
              // phase after flushSync returns; drain them too.
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
