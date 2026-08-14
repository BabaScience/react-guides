/**
 * The isolated exercise runtime.
 *
 * This file is NOT part of the app bundle. It is built separately
 * (vite.sandbox.config.ts) into one self-contained classic script, which the
 * parent injects into an `<iframe sandbox="allow-scripts">` via `srcdoc`.
 *
 * Why that shape, specifically:
 *
 *   - `sandbox` *without* `allow-same-origin` gives the frame an opaque origin.
 *     Learner code therefore cannot reach `localStorage` (which holds every
 *     solved exercise and every line of saved code), the app's DOM, or its
 *     cookies. Both are SecurityError, not "inconvenient".
 *   - An opaque origin cannot fetch the app's ES modules — module scripts are
 *     CORS-checked and `null` satisfies no allowlist. Hence one bundle, inlined
 *     as text, with no imports to resolve at runtime. This is also why the
 *     bundle is a classic IIFE rather than `type="module"`.
 *   - Because the frame owns its whole module graph, it can carry React's
 *     *development* build while the app ships production React. That is the
 *     functional payoff: a real `act()`, so `@testing-library/react` behaves
 *     the way its own documentation says it does.
 *
 * What that last point deletes, rather than adds:
 *   - the `patch-testing-library-act` Vite plugin, which rewrote TL's `domAct`
 *     to a pass-through because production `act()` throws;
 *   - the `flushSync` render interceptor in the old `test-runner.ts`;
 *   - the `test-root` container and the `screen` Proxy that scoped queries to
 *     it — this document's body contains the render output and nothing else,
 *     so TL's default `screen` is already correctly scoped.
 */
import { createTestHarness } from '@/sandbox/test-harness';
import type { TestRunResult } from '@/types/exercise';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactNativeWeb from 'react-native-web';
import * as TestingLib from '@testing-library/react';
import * as UserEvent from '@testing-library/user-event';

/** Tells React's development build that updates may be batched by `act()`. */
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface RunMessage {
  type: 'run';
  id: number;
  /** Already transpiled to CommonJS by the parent, and already loop-guarded. */
  userCode: string;
  spec: string;
  exerciseNumber: number;
}

/**
 * Babel's `_interopRequireDefault` checks `obj.__esModule`: when false it wraps
 * the value as `{ default: obj }`, so `_userEvent.default.setup` resolves to
 * `namespace.setup` (undefined) instead of `namespace.default.setup`. Marking
 * the namespace makes the interop unwrap it correctly.
 */
const asEsm = (mod: unknown): unknown =>
  mod && typeof mod === 'object' ? { __esModule: true, ...(mod as Record<string, unknown>) } : mod;

/** Execute transpiled CommonJS with an explicit `require` and extra globals. */
function executeAsCommonJS(
  code: string,
  exports: Record<string, unknown>,
  require: (id: string) => unknown,
  globals?: Record<string, unknown>
): void {
  const globalDeclarations = globals
    ? Object.keys(globals)
        .map((key) => `var ${key} = __globals__[${JSON.stringify(key)}];`)
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
    if (module.exports !== exports) {
      Object.assign(exports, module.exports);
    }
  } catch (e) {
    throw new Error(`Module execution error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function runExercise(message: RunMessage): Promise<TestRunResult> {
  // Between tests, wipe whatever the previous one rendered. TL's own cleanup
  // handles containers it created; the sweep catches code that rendered
  // straight into the body without going through `render()`.
  const tlCleanup = (TestingLib as { cleanup?: () => void }).cleanup;
  const afterEachTest = () => {
    try {
      tlCleanup?.();
    } catch {
      /* ignore */
    }
    document.body.replaceChildren();
  };

  const harness = createTestHarness({ afterEachTest });

  const userExports: Record<string, unknown> = {};
  const userRequire = (id: string): unknown => {
    if (id === 'react') return React;
    if (id === 'react-dom') return ReactDOM;
    if (id === 'react-native') return ReactNativeWeb;
    console.warn(`[user code] Unknown require: ${id}`);
    return {};
  };

  executeAsCommonJS(message.userCode, userExports, userRequire);

  const testExports: Record<string, unknown> = {};
  const testRequire = (id: string): unknown => {
    switch (id) {
      case 'react':
        return asEsm(React);
      case 'react-dom':
      case 'react-dom/client':
        return asEsm(ReactDOM);
      case 'react-native':
        return asEsm(ReactNativeWeb);
      case '@testing-library/react':
        return asEsm(TestingLib);
      case '@testing-library/jest-dom':
        return { __esModule: true };
      case '@testing-library/user-event':
        return asEsm(UserEvent);
      case './index':
      case '../index':
      case './':
        return userExports;
      default:
        console.warn(`[test code] Unknown require: ${id}`);
        return {};
    }
  };

  // `global` is a Node idiom the specs use for `global.fetch = jest.fn()`.
  // Mapping it to `globalThis` keeps those writes and `jest.spyOn(global, …)`
  // pointed at the real window object — this frame's, not the app's.
  const testGlobals: Record<string, unknown> = {
    describe: harness.describe,
    it: harness.it,
    test: harness.it,
    expect: harness.expect,
    beforeEach: harness.beforeEach,
    afterEach: harness.afterEach,
    beforeAll: harness.beforeAll,
    afterAll: harness.afterAll,
    jest: harness.jest,
    waitFor: harness.waitFor,
    React,
    global: globalThis,
  };

  executeAsCommonJS(message.spec, testExports, testRequire, testGlobals);

  try {
    const results = await harness.run(message.exerciseNumber);
    return {
      timestamp: Date.now(),
      passed: results.filter((r) => r.status === 'passed').length,
      failed: results.filter((r) => r.status === 'failed').length,
      total: results.length,
      cases: results,
    };
  } finally {
    afterEachTest();
  }
}

window.addEventListener('message', (event: MessageEvent) => {
  const message = event.data as RunMessage | undefined;
  if (!message || message.type !== 'run') return;

  runExercise(message)
    .then((result) => {
      parent.postMessage({ type: 'result', id: message.id, result }, '*');
    })
    .catch((error: unknown) => {
      parent.postMessage(
        {
          type: 'error',
          id: message.id,
          message: error instanceof Error ? error.message : String(error),
        },
        '*'
      );
    });
});

// The parent holds off on posting work until this lands.
parent.postMessage({ type: 'ready' }, '*');
