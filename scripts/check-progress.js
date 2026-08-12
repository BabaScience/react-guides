#!/usr/bin/env node
/**
 * Progress report for the CLI workflow.
 *
 * Runs jest once for everything and groups the results by module, rather than
 * spawning a separate jest process per module against a hard-coded list of
 * twelve React modules (which is what this used to do — it could not see the
 * `rn-` or `js-` tracks, and paid a full jest startup twelve times over).
 *
 * Usage:
 *   npm run progress            everything
 *   npm run progress -- react   one track
 */

const { execFileSync } = require('child_process');
const path = require('path');
const { selectDirs, jestBin } = require('./exercise-dirs');

const selector = process.argv.slice(2).find((a) => !a.startsWith('--'));
const modules = selectDirs(selector);

if (modules.length === 0) {
  console.log('\nNo exercise directories found.\n');
  process.exit(0);
}

const pattern = modules.map((m) => `src/${m.dir}/index\\.test\\.tsx`).join('|');

const jest = jestBin();
if (!jest) {
  console.log('jest is not installed. Run `npm install` at the repo root first.\n');
  process.exit(1);
}

let report;
try {
  const raw = execFileSync(
    process.execPath,
    [jest, `--testPathPattern=${pattern}`, '--silent', '--json'],
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 }
  );
  report = JSON.parse(raw);
} catch (error) {
  // jest exits non-zero when tests fail, but still prints the JSON report —
  // failing tests are the normal state here, so parse it out of stdout.
  try {
    report = JSON.parse(String(error.stdout).slice(String(error.stdout).indexOf('{')));
  } catch {
    console.log('\nCould not run jest. Try `npm install` first.\n');
    process.exit(1);
  }
}

/** dir → { passed, total } */
const byModule = new Map(modules.map((m) => [m.dir, { passed: 0, total: 0 }]));

for (const suite of report.testResults || []) {
  const dir = path.relative(path.join(__dirname, '..', 'src'), suite.name).split(path.sep)[0];
  const bucket = byModule.get(dir);
  if (!bucket) continue;
  for (const test of suite.assertionResults || []) {
    bucket.total++;
    if (test.status === 'passed') bucket.passed++;
  }
}

function bar(current, total, width = 30) {
  if (total === 0) return '░'.repeat(width);
  const filled = Math.round((current / total) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

console.log('\nProgress report\n' + '='.repeat(60));

let currentTrack = null;
let totalPassed = 0;
let totalTests = 0;

for (const m of modules) {
  if (m.track !== currentTrack) {
    currentTrack = m.track;
    console.log(`\n${currentTrack}\n${'-'.repeat(60)}`);
  }
  const { passed, total } = byModule.get(m.dir);
  totalPassed += passed;
  totalTests += total;

  const pct = total > 0 ? ((passed / total) * 100).toFixed(0) : '0';
  const mark = total > 0 && passed === total ? 'done' : '    ';
  console.log(`${mark} ${m.dir}`);
  console.log(`     ${bar(passed, total)} ${passed}/${total} (${pct}%)`);
}

const overall = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';
console.log('\n' + '='.repeat(60));
console.log(`Overall: ${totalPassed}/${totalTests} tests (${overall}%)`);
console.log(
  totalTests > 0 && totalPassed === totalTests
    ? '\nEvery exercise passes.\n'
    : '\nKeep going.\n'
);
