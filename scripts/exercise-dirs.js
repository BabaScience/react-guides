/**
 * Discovers exercise directories from disk instead of hard-coding them.
 *
 * The CLI runner used to carry a literal list of the twelve React modules, so
 * it could not see the `rn-` or `js-` tracks at all and rejected any module
 * number above 12. Reading the filesystem keeps it correct as tracks are added.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

/** Track a directory belongs to, inferred from its prefix. */
function trackOf(dir) {
  if (dir.startsWith('rn-')) return 'react-native';
  if (dir.startsWith('js-')) return 'javascript';
  return 'react';
}

/** Human label: `07-data-fetching` → `07 data fetching`. */
function labelOf(dir) {
  return dir.replace(/-/g, ' ');
}

/** Every `src/<module>/` that actually has a test file, in directory order. */
function exerciseDirs() {
  if (!fs.existsSync(SRC)) return [];
  return fs
    .readdirSync(SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => fs.existsSync(path.join(SRC, name, 'index.test.tsx')))
    .sort()
    .map((name) => ({ dir: name, track: trackOf(name), label: labelOf(name) }));
}

/**
 * Resolve a user-supplied selector to a set of directories.
 *
 * Accepts:
 *   (nothing)       every module
 *   `3`             React modules 1..3 — the original numeric behaviour
 *   `07`, `rn-04`   one module, by directory prefix
 *   `react`, `js`   a whole track
 */
function selectDirs(selector) {
  const all = exerciseDirs();
  if (!selector) return all;

  const trackAliases = {
    react: 'react',
    rn: 'react-native',
    'react-native': 'react-native',
    js: 'javascript',
    javascript: 'javascript',
  };
  const track = trackAliases[selector.toLowerCase()];
  if (track) return all.filter((m) => m.track === track);

  // A bare number keeps the historical "modules 1..N of the React track" shape.
  if (/^\d+$/.test(selector)) {
    const max = parseInt(selector, 10);
    return all.filter(
      (m) => m.track === 'react' && parseInt(m.dir.slice(0, 2), 10) <= max
    );
  }

  return all.filter((m) => m.dir === selector || m.dir.startsWith(`${selector}-`));
}

/**
 * Absolute path to the local jest CLI.
 *
 * Resolving it explicitly means these scripts work when run directly
 * (`node scripts/test-runner.js`), not only through npm — npm is what would
 * otherwise put `node_modules/.bin` on PATH.
 */
function jestBin() {
  // jest's package.json `exports` map exposes the CLI as `./bin/jest`, without
  // the extension — `jest/bin/jest.js` does not resolve. Try both, then fall
  // back to the path on disk for older layouts.
  for (const specifier of ['jest/bin/jest', 'jest/bin/jest.js']) {
    try {
      return require.resolve(specifier, { paths: [ROOT] });
    } catch {
      /* try the next form */
    }
  }
  const onDisk = path.join(ROOT, 'node_modules', 'jest', 'bin', 'jest.js');
  return fs.existsSync(onDisk) ? onDisk : null;
}

module.exports = { ROOT, SRC, exerciseDirs, selectDirs, jestBin };
