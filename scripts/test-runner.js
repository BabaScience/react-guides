#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const moduleArg = args.find(arg => !arg.startsWith('--'));
const isWatch = args.includes('--watch');

if (!moduleArg || isNaN(moduleArg)) {
  console.log('\n❌ Usage: npm test [module_number] [options]');
  console.log('\nExamples:');
  console.log('  npm test 1           - Test module 1 only');
  console.log('  npm test 3           - Test modules 1, 2, and 3');
  console.log('  npm test 5 -- --watch - Watch mode for modules 1-5');
  console.log('\n');
  process.exit(1);
}

const maxModule = parseInt(moduleArg);

if (maxModule < 1 || maxModule > 12) {
  console.log('\n❌ Module number must be between 1 and 12\n');
  process.exit(1);
}

// Generate array of module numbers: ['01', '02', '03', ...]
const modules = Array.from(
  { length: maxModule },
  (_, i) => String(i + 1).padStart(2, '0')
);

// Create test pattern that matches any of these modules
const testPattern = modules
  .map(num => `src/${num}-[^/]+/index\\.test\\.tsx`)
  .join('|');

console.log(`\n🧪 Running tests for modules 1-${maxModule}\n`);
console.log('Modules included:', modules.join(', '));
console.log('');

const watchFlag = isWatch ? '--watch' : '';

try {
  execSync(
    `jest --testPathPattern="${testPattern}" ${watchFlag}`,
    {
      stdio: 'inherit',
      cwd: process.cwd()
    }
  );
} catch (error) {
  console.log('\n❌ Tests failed\n');
  process.exit(1);
}
