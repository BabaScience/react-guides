#!/usr/bin/env node
/**
 * CLI exercise runner — the offline counterpart to the in-browser runner.
 *
 * Usage:
 *   npm test                    every module, every track
 *   npm test 3                  React modules 1–3
 *   npm test 07                 one module
 *   npm test rn-04              one module in another track
 *   npm test js                 a whole track
 *   npm test 3 -- --watch       watch mode
 */

const { execFileSync } = require('child_process');
const { exerciseDirs, selectDirs, jestBin } = require('./exercise-dirs');

const args = process.argv.slice(2);
const selector = args.find((a) => !a.startsWith('--'));
const isWatch = args.includes('--watch');

const selected = selectDirs(selector);

if (selected.length === 0) {
  const available = exerciseDirs();
  console.log(`\nNothing matched "${selector}".\n`);
  if (available.length === 0) {
    console.log('No exercise directories found under src/.\n');
  } else {
    console.log('Available modules:');
    for (const m of available) console.log(`  ${m.dir}  (${m.track})`);
    console.log('\nOr pass a track: react | rn | js\n');
  }
  process.exit(1);
}

const pattern = selected.map((m) => `src/${m.dir}/index\\.test\\.tsx`).join('|');

console.log(`\nRunning tests for ${selected.length} module(s):`);
for (const m of selected) console.log(`  ${m.dir}`);
console.log('');

const jest = jestBin();
if (!jest) {
  console.log('jest is not installed. Run `npm install` at the repo root first.\n');
  process.exit(1);
}

const jestArgs = [`--testPathPattern=${pattern}`];
if (isWatch) jestArgs.push('--watch');

try {
  execFileSync(process.execPath, [jest, ...jestArgs], { stdio: 'inherit' });
} catch {
  console.log('\nTests failed.\n');
  process.exit(1);
}
