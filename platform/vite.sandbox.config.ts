import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Builds the isolated exercise runtime (`sandbox-host/main.ts`) into a single
 * classic script at `public/sandbox-host.js`.
 *
 * Separate from the app build on purpose:
 *
 *   - **`NODE_ENV=development`.** The app ships production React; this bundle
 *     carries the development build so `act()` actually works. That is the
 *     whole reason the frame exists as its own realm, and it cannot be
 *     expressed as a chunk of a production build.
 *   - **One file, IIFE, no code splitting.** The frame runs on an opaque
 *     origin, where module scripts fail CORS and relative chunk URLs resolve
 *     against `null`. The parent inlines this file's text into `srcdoc`, so it
 *     must have no runtime imports at all.
 *   - **Emitted into `public/`.** Vite serves that directory identically in dev
 *     and in a production build, so the frame is loaded exactly one way in both.
 *     §4.2(b) of ANALYSIS.md was a bug that existed only because dev and prod
 *     resolved content differently; this avoids re-creating that shape.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react-native': 'react-native-web',
    },
  },
  define: {
    // React and @testing-library branch on this. Development is the point.
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  // This build's output *is* the public directory; without this Vite warns
  // about copying `public/` into itself.
  publicDir: false,
  build: {
    outDir: 'public',
    emptyOutDir: false,
    // Development React, and readable stacks when an exercise throws.
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'sandbox-host/main.ts'),
      formats: ['iife'],
      name: 'ReactMasterySandbox',
      fileName: () => 'sandbox-host.js',
    },
    rollupOptions: {
      output: {
        // Any chunk beyond the entry would need a URL the frame cannot resolve.
        inlineDynamicImports: true,
      },
    },
  },
});
