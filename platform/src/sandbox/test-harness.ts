/**
 * Lightweight test harness implementing a Jest-like API for in-browser execution.
 *
 * Implements: describe (nestable), it/test, expect, beforeEach, afterEach,
 * beforeAll, afterAll, jest.fn, jest.spyOn, waitFor.
 *
 * Hook semantics follow Jest: beforeEach runs outermost-first, afterEach
 * innermost-first, beforeAll once per suite before its first test, afterAll
 * once after its last. A suite's hooks apply to every test nested below it.
 */

type Hook = () => Promise<void> | void;

export interface TestHarnessOptions {
  /** Called after every test, success or failure. Use for testing-library cleanup. */
  afterEachTest?: () => void | Promise<void>;
}

interface Suite {
  /** Full path, e.g. "Module 10 > Exercise 6: fetchUserName". */
  name: string;
  parent: Suite | null;
  beforeEachFns: Hook[];
  afterEachFns: Hook[];
  beforeAllFns: Hook[];
  afterAllFns: Hook[];
  beforeAllRan: boolean;
}

export function createTestHarness(options: TestHarnessOptions = {}) {
  const results: Array<{
    name: string;
    status: 'passed' | 'failed';
    error?: string;
    duration: number;
  }> = [];

  /** Flat, in registration order — a test carries the suite it was declared in. */
  const tests: Array<{ name: string; fn: Hook; suite: Suite }> = [];
  const allSuites: Suite[] = [];

  const rootSuite: Suite = {
    name: '',
    parent: null,
    beforeEachFns: [],
    afterEachFns: [],
    beforeAllFns: [],
    afterAllFns: [],
    beforeAllRan: false,
  };
  allSuites.push(rootSuite);

  let currentSuite: Suite = rootSuite;

  /** Root → leaf, so beforeEach/beforeAll run in declaration order. */
  function chainOf(suite: Suite): Suite[] {
    const chain: Suite[] = [];
    for (let s: Suite | null = suite; s; s = s.parent) chain.unshift(s);
    return chain;
  }

  function describe(name: string, fn: () => void) {
    const suite: Suite = {
      name: currentSuite.name ? `${currentSuite.name} > ${name}` : name,
      parent: currentSuite,
      beforeEachFns: [],
      afterEachFns: [],
      beforeAllFns: [],
      afterAllFns: [],
      beforeAllRan: false,
    };
    allSuites.push(suite);

    const prev = currentSuite;
    currentSuite = suite;
    try {
      fn();
    } finally {
      currentSuite = prev;
    }
  }

  function it(name: string, fn: Hook) {
    tests.push({ name, fn, suite: currentSuite });
  }

  const beforeEach = (fn: Hook) => currentSuite.beforeEachFns.push(fn);
  const afterEach = (fn: Hook) => currentSuite.afterEachFns.push(fn);
  const beforeAll = (fn: Hook) => currentSuite.beforeAllFns.push(fn);
  const afterAll = (fn: Hook) => currentSuite.afterAllFns.push(fn);

  // --- expect ---
  function expect(actual: unknown) {
    return createMatchers(actual, false);
  }

  // expect.stringContaining
  expect.stringContaining = (str: string) => ({
    __stringContaining: true,
    value: str,
    asymmetricMatch(other: unknown) {
      return typeof other === 'string' && other.includes(str);
    },
  });

  expect.objectContaining = (obj: Record<string, unknown>) => ({
    __objectContaining: true,
    value: obj,
    asymmetricMatch(other: unknown) {
      if (typeof other !== 'object' || other === null) return false;
      return Object.keys(obj).every((key) =>
        deepEqual((other as Record<string, unknown>)[key], obj[key])
      );
    },
  });

  expect.any = (constructor: unknown) => ({
    __any: true,
    asymmetricMatch(other: unknown) {
      if (constructor === String) return typeof other === 'string';
      if (constructor === Number) return typeof other === 'number';
      if (constructor === Boolean) return typeof other === 'boolean';
      if (typeof constructor === 'function') return other instanceof (constructor as new (...args: unknown[]) => unknown);
      return false;
    },
  });

  function createMatchers(actual: unknown, negated: boolean) {
    const matchers = {
      get not() {
        return createMatchers(actual, !negated);
      },

      toBe(expected: unknown) {
        const pass = actual === expected;
        if (negated ? pass : !pass) {
          throw new Error(`Expected ${fmt(actual)} ${negated ? 'not ' : ''}to be ${fmt(expected)}`);
        }
      },

      toEqual(expected: unknown) {
        const pass = deepEqual(actual, expected);
        if (negated ? pass : !pass) {
          throw new Error(
            `Expected ${fmt(actual)} ${negated ? 'not ' : ''}to equal ${fmt(expected)}`
          );
        }
      },

      toHaveLength(expected: number) {
        const len = (actual as unknown[])?.length;
        const pass = len === expected;
        if (negated ? pass : !pass) {
          throw new Error(
            `Expected length ${len} ${negated ? 'not ' : ''}to be ${expected}`
          );
        }
      },

      toBeTruthy() {
        const pass = !!actual;
        if (negated ? pass : !pass) {
          throw new Error(`Expected ${fmt(actual)} ${negated ? 'not ' : ''}to be truthy`);
        }
      },

      toBeFalsy() {
        const pass = !actual;
        if (negated ? pass : !pass) {
          throw new Error(`Expected ${fmt(actual)} ${negated ? 'not ' : ''}to be falsy`);
        }
      },

      toBeNull() {
        const pass = actual === null;
        if (negated ? pass : !pass) {
          throw new Error(`Expected ${fmt(actual)} ${negated ? 'not ' : ''}to be null`);
        }
      },

      toBeDefined() {
        const pass = actual !== undefined;
        if (negated ? pass : !pass) {
          throw new Error(`Expected value ${negated ? 'not ' : ''}to be defined`);
        }
      },

      toBeUndefined() {
        const pass = actual === undefined;
        if (negated ? pass : !pass) {
          throw new Error(`Expected ${fmt(actual)} ${negated ? 'not ' : ''}to be undefined`);
        }
      },

      toContain(expected: unknown) {
        const pass = Array.isArray(actual)
          ? actual.includes(expected)
          : typeof actual === 'string' && typeof expected === 'string'
            ? actual.includes(expected)
            : false;
        if (negated ? pass : !pass) {
          throw new Error(`Expected ${fmt(actual)} ${negated ? 'not ' : ''}to contain ${fmt(expected)}`);
        }
      },

      toBeGreaterThan(expected: number) {
        const pass = (actual as number) > expected;
        if (negated ? pass : !pass) {
          throw new Error(`Expected ${actual} ${negated ? 'not ' : ''}to be greater than ${expected}`);
        }
      },

      toBeLessThan(expected: number) {
        const pass = (actual as number) < expected;
        if (negated ? pass : !pass) {
          throw new Error(`Expected ${actual} ${negated ? 'not ' : ''}to be less than ${expected}`);
        }
      },

      toThrow(expectedMsg?: string | RegExp) {
        let threw = false;
        let thrownError: unknown;
        try {
          (actual as () => void)();
        } catch (e) {
          threw = true;
          thrownError = e;
        }
        let pass = threw;
        if (threw && expectedMsg) {
          const msg = thrownError instanceof Error ? thrownError.message : String(thrownError);
          pass = typeof expectedMsg === 'string' ? msg.includes(expectedMsg) : expectedMsg.test(msg);
        }
        if (negated ? pass : !pass) {
          throw new Error(`Expected function ${negated ? 'not ' : ''}to throw${expectedMsg ? ` ${expectedMsg}` : ''}`);
        }
      },

      // --- jest-dom matchers ---
      toBeInTheDocument() {
        const el = actual as Element | null;
        const pass = el !== null && el !== undefined && document.contains(el);
        if (negated ? pass : !pass) {
          throw new Error(`Expected element ${negated ? 'not ' : ''}to be in the document`);
        }
      },

      toHaveValue(expected: unknown) {
        const el = actual as HTMLInputElement;
        const pass = el.value === expected;
        if (negated ? pass : !pass) {
          throw new Error(
            `Expected input to have value ${fmt(expected)}, but got ${fmt(el.value)}`
          );
        }
      },

      toHaveTextContent(expected: string | RegExp) {
        const el = actual as Element;
        const text = el.textContent || '';
        const pass =
          typeof expected === 'string' ? text.includes(expected) : expected.test(text);
        if (negated ? pass : !pass) {
          throw new Error(
            `Expected element ${negated ? 'not ' : ''}to have text content "${expected}", got "${text}"`
          );
        }
      },

      toBeChecked() {
        const el = actual as HTMLInputElement;
        const pass = el.checked === true;
        if (negated ? pass : !pass) {
          throw new Error(`Expected checkbox ${negated ? 'not ' : ''}to be checked`);
        }
      },

      toBeDisabled() {
        const el = actual as HTMLButtonElement;
        const pass = el.disabled === true;
        if (negated ? pass : !pass) {
          throw new Error(`Expected element ${negated ? 'not ' : ''}to be disabled`);
        }
      },

      toHaveClass(...classes: string[]) {
        const el = actual as Element;
        const pass = classes.every((c) => el.classList.contains(c));
        if (negated ? pass : !pass) {
          throw new Error(
            `Expected element ${negated ? 'not ' : ''}to have class(es) ${classes.join(', ')}`
          );
        }
      },

      toHaveAttribute(attr: string, value?: string) {
        const el = actual as Element;
        const has = el.hasAttribute(attr);
        const pass = value !== undefined ? has && el.getAttribute(attr) === value : has;
        if (negated ? pass : !pass) {
          throw new Error(
            `Expected element ${negated ? 'not ' : ''}to have attribute "${attr}"${value !== undefined ? ` with value "${value}"` : ''}`
          );
        }
      },

      toHaveStyle(styles: Record<string, string>) {
        const el = actual as HTMLElement;
        const computed = window.getComputedStyle(el);
        const pass = Object.entries(styles).every(
          ([prop, val]) => computed.getPropertyValue(prop) === val
        );
        if (negated ? pass : !pass) {
          throw new Error(`Expected element ${negated ? 'not ' : ''}to have styles ${JSON.stringify(styles)}`);
        }
      },

      // --- mock matchers ---
      toHaveBeenCalled() {
        const mock = actual as MockFn;
        const pass = mock.mock.calls.length > 0;
        if (negated ? pass : !pass) {
          throw new Error(
            `Expected function ${negated ? 'not ' : ''}to have been called (called ${mock.mock.calls.length} times)`
          );
        }
      },

      toHaveBeenCalledTimes(count: number) {
        const mock = actual as MockFn;
        const pass = mock.mock.calls.length === count;
        if (negated ? pass : !pass) {
          throw new Error(
            `Expected function to have been called ${count} times, but was called ${mock.mock.calls.length} times`
          );
        }
      },

      toHaveBeenCalledWith(...args: unknown[]) {
        const mock = actual as MockFn;
        const pass = mock.mock.calls.some((call) => deepEqual(call, args));
        if (negated ? pass : !pass) {
          throw new Error(
            `Expected function ${negated ? 'not ' : ''}to have been called with ${fmt(args)}`
          );
        }
      },
    };

    return matchers;
  }

  // --- jest.fn ---
  interface MockFn {
    (...args: unknown[]): unknown;
    mock: {
      calls: unknown[][];
      results: Array<{ type: string; value: unknown }>;
    };
    mockClear: () => MockFn;
    mockReset: () => MockFn;
    mockImplementation: (fn: (...args: unknown[]) => unknown) => MockFn;
    mockReturnValue: (val: unknown) => MockFn;
    mockReturnValueOnce: (val: unknown) => MockFn;
    mockResolvedValue: (val: unknown) => MockFn;
    mockResolvedValueOnce: (val: unknown) => MockFn;
    mockRejectedValue: (val: unknown) => MockFn;
    mockRejectedValueOnce: (val: unknown) => MockFn;
  }

  function createMockFn(impl?: (...args: unknown[]) => unknown): MockFn {
    let implementation = impl || (() => undefined);
    const onceQueue: Array<(...args: unknown[]) => unknown> = [];

    const mock: MockFn['mock'] = { calls: [], results: [] };

    const fn = ((...args: unknown[]) => {
      mock.calls.push(args);
      try {
        const activeFn = onceQueue.length > 0 ? onceQueue.shift()! : implementation;
        const result = activeFn(...args);
        mock.results.push({ type: 'return', value: result });
        return result;
      } catch (e) {
        mock.results.push({ type: 'throw', value: e });
        throw e;
      }
    }) as MockFn;

    fn.mock = mock;

    fn.mockClear = () => {
      mock.calls.length = 0;
      mock.results.length = 0;
      return fn;
    };

    fn.mockReset = () => {
      fn.mockClear();
      implementation = () => undefined;
      onceQueue.length = 0;
      return fn;
    };

    fn.mockImplementation = (newImpl) => {
      implementation = newImpl;
      return fn;
    };

    fn.mockReturnValue = (val) => {
      implementation = () => val;
      return fn;
    };

    fn.mockReturnValueOnce = (val) => {
      onceQueue.push(() => val);
      return fn;
    };

    fn.mockResolvedValue = (val) => {
      implementation = () => Promise.resolve(val);
      return fn;
    };

    fn.mockResolvedValueOnce = (val) => {
      onceQueue.push(() => Promise.resolve(val));
      return fn;
    };

    fn.mockRejectedValue = (val) => {
      implementation = () => Promise.reject(val);
      return fn;
    };

    fn.mockRejectedValueOnce = (val) => {
      onceQueue.push(() => Promise.reject(val));
      return fn;
    };

    return fn;
  }

  // --- jest.spyOn ---
  function spyOn(
    obj: Record<string, unknown>,
    method: string
  ): MockFn {
    const original = obj[method] as (...args: unknown[]) => unknown;
    const mock = createMockFn(original);
    const originalRestore = mock.mockClear;
    obj[method] = mock;

    // Add mockRestore to restore original
    (mock as unknown as Record<string, unknown>).mockRestore = () => {
      obj[method] = original;
      originalRestore();
    };

    return mock;
  }

  const jest = {
    fn: createMockFn,
    spyOn,
  };

  // --- waitFor ---
  async function waitFor(
    callback: () => void | Promise<void>,
    options?: { timeout?: number; interval?: number }
  ): Promise<void> {
    const timeout = options?.timeout ?? 1000;
    const interval = options?.interval ?? 50;
    const start = Date.now();

    while (true) {
      try {
        await callback();
        return;
      } catch (e) {
        if (Date.now() - start >= timeout) throw e;
        await new Promise((r) => setTimeout(r, interval));
      }
    }
  }

  // --- run tests ---
  async function run(filterExerciseNumber?: number): Promise<typeof results> {
    // Match the filter against the *full* suite path, so tests inside a
    // `describe` nested under `describe('Exercise 6: …')` still run.
    const testsToRun =
      filterExerciseNumber === undefined
        ? tests
        : tests.filter((t) => {
            const match = t.suite.name.match(/Exercise\s+(\d+)/i);
            return match !== null && parseInt(match[1], 10) === filterExerciseNumber;
          });

    const startedSuites: Suite[] = [];

    for (const test of testsToRun) {
      const chain = chainOf(test.suite);
      const start = performance.now();

      try {
        // beforeAll: once per suite, outermost first.
        for (const suite of chain) {
          if (suite.beforeAllRan) continue;
          suite.beforeAllRan = true;
          startedSuites.push(suite);
          for (const fn of suite.beforeAllFns) await fn();
        }

        for (const suite of chain) {
          for (const fn of suite.beforeEachFns) await fn();
        }

        await test.fn();

        results.push({
          name: `${test.suite.name} > ${test.name}`,
          status: 'passed',
          duration: Math.round(performance.now() - start),
        });
      } catch (e) {
        results.push({
          name: `${test.suite.name} > ${test.name}`,
          status: 'failed',
          error: e instanceof Error ? e.message : String(e),
          duration: Math.round(performance.now() - start),
        });
      } finally {
        // afterEach runs innermost-first, like Jest. A throwing hook must not
        // mask the test result, so each is isolated.
        for (const suite of [...chain].reverse()) {
          for (const fn of [...suite.afterEachFns].reverse()) {
            try {
              await fn();
            } catch {
              /* hook failures don't overwrite the test outcome */
            }
          }
        }
        // Internal cleanup always runs last: unmount anything
        // @testing-library/react rendered so it can't leak into the next test.
        if (options.afterEachTest) {
          try {
            await options.afterEachTest();
          } catch {
            /* cleanup failures should not mask test results */
          }
        }
      }
    }

    // afterAll for every suite that actually started, innermost first.
    for (const suite of startedSuites.reverse()) {
      for (const fn of [...suite.afterAllFns].reverse()) {
        try {
          await fn();
        } catch {
          /* teardown failures don't invalidate results already recorded */
        }
      }
    }

    return results;
  }

  return {
    describe,
    it,
    test: it,
    expect,
    beforeEach,
    afterEach,
    beforeAll,
    afterAll,
    jest,
    waitFor,
    run,
  };
}

// --- utilities ---
function fmt(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

function deepEqual(a: unknown, b: unknown): boolean {
  // Handle asymmetric matchers
  if (b !== null && typeof b === 'object' && 'asymmetricMatch' in b) {
    return (b as { asymmetricMatch: (v: unknown) => boolean }).asymmetricMatch(a);
  }

  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) =>
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }

  return false;
}
