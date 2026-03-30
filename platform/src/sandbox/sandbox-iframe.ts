import { transpile, preprocessTypeScript } from './transpiler';
import { createTestHarness } from './test-harness';
import type { TestRunResult } from '@/types/exercise';

/**
 * Runs tests in the main window using a temporary DOM container.
 */
export async function runTestsInSandbox(
  userCode: string,
  testCode: string,
  exerciseNumber: number
): Promise<TestRunResult> {
  // 1. Preprocess and transpile both files
  const processedUserCode = preprocessTypeScript(userCode);
  const processedTestCode = preprocessTypeScript(testCode);

  let transpiledUser: string;
  let transpiledTest: string;

  try {
    transpiledUser = await transpile(processedUserCode, 'index.tsx');
  } catch (e) {
    return errorResult('Compilation Error in your code', e);
  }

  try {
    transpiledTest = await transpile(processedTestCode, 'index.test.tsx');
  } catch (e) {
    return errorResult('Compilation Error in test file', e);
  }

  // 2. Load all dependencies
  const React = await lazyLoad('react', () => import('react'));
  const ReactDOM = await lazyLoad('react-dom', () => import('react-dom'));
  const TestingLib = await lazyLoad('@testing-library/react', () => import('@testing-library/react'));
  const UserEvent = await lazyLoad('@testing-library/user-event', () => import('@testing-library/user-event'));

  // 3. Create test environment
  const harness = createTestHarness();
  const container = document.createElement('div');
  container.id = 'test-root';
  document.body.appendChild(container);

  try {
    // 4. Execute user code to collect exports
    const userExports: Record<string, unknown> = {};

    const userRequire = (id: string): unknown => {
      if (id === 'react') return React;
      if (id === 'react-dom') return ReactDOM;
      console.warn(`[user code] Unknown require: ${id}`);
      return {};
    };

    executeAsCommonJS(transpiledUser, userExports, userRequire);

    // 5. Execute test code with full harness
    const testExports: Record<string, unknown> = {};

    const testRequire = (id: string): unknown => {
      switch (id) {
        case 'react': return React;
        case 'react-dom': return ReactDOM;
        case 'react-dom/client': return ReactDOM;
        case '@testing-library/react': return TestingLib;
        case '@testing-library/jest-dom': return {};
        case '@testing-library/user-event': return UserEvent;
        case './index':
        case '../index':
        case './':
          return userExports;
        default:
          console.warn(`[test code] Unknown require: ${id}`);
          return {};
      }
    };

    // Inject test globals into the execution scope
    const testGlobals: Record<string, unknown> = {
      describe: harness.describe,
      it: harness.it,
      test: harness.it,
      expect: harness.expect,
      beforeEach: harness.beforeEach,
      afterEach: () => {}, // noop for compatibility
      jest: harness.jest,
      waitFor: harness.waitFor,
      React,
    };

    executeAsCommonJS(transpiledTest, testExports, testRequire, testGlobals);

    // 6. Run tests for the specific exercise
    const results = await harness.run(exerciseNumber);

    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return {
      timestamp: Date.now(),
      passed,
      failed,
      total: results.length,
      cases: results,
    };
  } finally {
    container.remove();
  }
}

/**
 * Execute transpiled CommonJS code with provided exports, require, and optional globals.
 */
function executeAsCommonJS(
  code: string,
  exports: Record<string, unknown>,
  require: (id: string) => unknown,
  globals?: Record<string, unknown>
): void {
  // Build the function body with module wrapper
  const globalDeclarations = globals
    ? Object.entries(globals)
        .map(([key, _]) => `var ${key} = __globals__["${key}"];`)
        .join('\n')
    : '';

  const wrappedCode = `
    (function(exports, require, module, __filename, __exports__, __globals__) {
      ${globalDeclarations}
      ${code}
    })
  `;

  try {
    const module = { exports };
    const fn = (0, eval)(wrappedCode);
    fn(exports, require, module, 'index.tsx', exports, globals || {});
    // Sync module.exports back if it was reassigned
    if (module.exports !== exports) {
      Object.assign(exports, module.exports);
    }
  } catch (e) {
    throw new Error(`Module execution error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// --- Lazy module cache ---
const moduleCache = new Map<string, unknown>();

async function lazyLoad<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (!moduleCache.has(key)) {
    moduleCache.set(key, await loader());
  }
  return moduleCache.get(key) as T;
}

function errorResult(context: string, error: unknown): TestRunResult {
  return {
    timestamp: Date.now(),
    passed: 0,
    failed: 1,
    total: 1,
    cases: [
      {
        name: context,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        duration: 0,
      },
    ],
  };
}
