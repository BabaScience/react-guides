#!/usr/bin/env node

const { execSync } = require('child_process');

const MODULES = [
  { num: '01', name: 'Fundamentals' },
  { num: '02', name: 'Hooks Deep Dive' },
  { num: '03', name: 'Component Patterns' },
  { num: '04', name: 'Styling' },
  { num: '05', name: 'Routing' },
  { num: '06', name: 'State Management' },
  { num: '07', name: 'Data Fetching' },
  { num: '08', name: 'Forms & Validation' },
  { num: '09', name: 'Performance' },
  { num: '10', name: 'Testing' },
  { num: '11', name: 'TypeScript' },
  { num: '12', name: 'Advanced Patterns' }
];

console.log('\n📊 React Mastery Progress Report\n');
console.log('='.repeat(60));

let totalPassed = 0;
let totalTests = 0;

MODULES.forEach((module, index) => {
  const testPath = `src/${module.num}-*/index.test.tsx`;
  
  try {
    const result = execSync(
      `jest --testPathPattern="${testPath}" --silent --json`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    const jsonResult = JSON.parse(result);
    const passed = jsonResult.numPassedTests || 0;
    const total = jsonResult.numTotalTests || 0;
    const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    totalPassed += passed;
    totalTests += total;
    
    const status = passed === total ? '✅' : '⏳';
    const bar = createProgressBar(passed, total);
    
    console.log(`${status} Module ${module.num}: ${module.name}`);
    console.log(`   ${bar} ${passed}/${total} (${percentage}%)`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ Module ${module.num}: ${module.name}`);
    console.log(`   Error running tests`);
    console.log('');
  }
});

console.log('='.repeat(60));
const overallPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
console.log(`\nOverall Progress: ${totalPassed}/${totalTests} tests (${overallPercentage}%)`);

if (totalPassed === totalTests && totalTests > 0) {
  console.log('\n🎉 Congratulations! All exercises completed!\n');
} else {
  console.log(`\n💪 Keep going! You're making great progress.\n`);
}

function createProgressBar(current, total, width = 30) {
  if (total === 0) return '░'.repeat(width);
  
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  return '█'.repeat(filled) + '░'.repeat(empty);
}
