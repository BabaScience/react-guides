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

  // 3. Create test environment.
  //
  // Key isolation problem: the app UI (test results panel, exercise
  // description, sidebar, etc.) lives in document.body alongside the test
  // render output. If we use TL's default `screen` (which queries body),
  // queries like `getByText(/increment/i)` match BOTH the user component
  // AND app text that happens to contain "increment" — e.g. a previous
  // test name in the results panel, or the exercise description.
  //
  // Fix: render the user's component into a dedicated `test-root` div, and
  // serve the user a wrapped `screen` whose queries are scoped to that
  // root via `within(test-root)`.
  const container = document.createElement('div');
  container.id = 'test-root';
  document.body.appendChild(container);

  // Defensive sweep: wipe test-root between tests AND remove any TL-managed
  // body children (in case user code rendered without our wrapped render).
  const tlCleanup =
    typeof (TestingLib as { cleanup?: () => void }).cleanup === 'function'
      ? (TestingLib as { cleanup: () => void }).cleanup
      : undefined;
  const bodyBaseline = new Set<Element>(Array.from(document.body.children));
  bodyBaseline.add(container);
  const afterEachTest = () => {
    try { tlCleanup?.(); } catch { /* ignore */ }
    for (const el of Array.from(document.body.children)) {
      if (!bodyBaseline.has(el)) {
        try { el.remove(); } catch { /* ignore */ }
      }
    }
    container.replaceChildren();
  };
  const harness = createTestHarness({ afterEachTest });

  // Wrap @testing-library/react so `screen` queries see only the most recent
  // render's container (not the entire document.body, which includes app UI
  // like the exercise description and the test-results panel — those would
  // otherwise match `getByText(/increment/i)` etc).
  //
  // We DON'T wrap `render` itself: React 18's event delegation gets confused
  // when the container is repositioned post-render, and user-event v14's
  // `user.type` stops firing onChange handlers. Leave render's default
  // behavior alone — it attaches a fresh <div> to document.body, which is
  // where React happily handles events.
  //
  // To make `screen` follow the latest render, intercept `render` to track
  // the container it created, and expose a Proxy `screen` that re-binds
  // `within(...)` queries to that container on every access.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TL = TestingLib as any;
  const wrappedTL: Record<string, unknown> = { ...TL };
  let lastRenderContainer: HTMLElement | null = null;
  if (typeof TL.render === 'function') {
    wrappedTL.render = (ui: unknown, options?: Record<string, unknown>) => {
      const result = TL.render(ui, options);
      lastRenderContainer = (result && (result as { container?: HTMLElement }).container) || null;
      return result;
    };
  }
  if (typeof TL.within === 'function') {
    wrappedTL.screen = new Proxy({}, {
      get(_t, key) {
        const target = lastRenderContainer ?? container;
        const scoped = TL.within(target);
        return scoped[key as string];
      },
    });
  }

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

    // Babel's `_interopRequireDefault(obj)` checks `obj.__esModule`: if true,
    // returns obj as-is; otherwise wraps it as `{ default: obj }`. Vite-bundled
    // ESM namespaces don't set `__esModule`, so the wrap path is taken — which
    // means `_userEvent.default.setup` resolves to `namespace.setup` (undefined)
    // instead of `namespace.default.setup` (the real method). Mark namespaces
    // as ES modules so the interop unwraps correctly.
    const asEsm = (mod: unknown): unknown =>
      mod && typeof mod === 'object' ? { __esModule: true, ...(mod as Record<string, unknown>) } : mod;

    const testRequire = (id: string): unknown => {
      switch (id) {
        case 'react': return asEsm(React);
        case 'react-dom': return asEsm(ReactDOM);
        case 'react-dom/client': return asEsm(ReactDOM);
        case '@testing-library/react': return asEsm(wrappedTL);
        case '@testing-library/jest-dom': return { __esModule: true };
        case '@testing-library/user-event': return asEsm(UserEvent);
        case './index':
        case '../index':
        case './':
          return userExports;
        default:
          console.warn(`[test code] Unknown require: ${id}`);
          return {};
      }
    };

    // Inject test globals into the execution scope.
    // `global` is a Node.js idiom: tests use it for `global.fetch = jest.fn()`.
    // Map it to the browser's globalThis so writes still mutate the real
    // (window-level) `fetch` and live `jest.spyOn(global, 'x')` keeps working.
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
      global: globalThis,
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
    afterEachTest();
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
