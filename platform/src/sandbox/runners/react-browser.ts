import { reassembleFullCode } from '@/sandbox/exercise-extractor';
import { withLoopGuard } from '@/sandbox/loop-guard';
import { transpile } from '@/sandbox/transpiler';
import { runInIsolatedFrame } from '@/sandbox/isolated-frame';
import { failureResult, type ExerciseRunner, type ExerciseRunRequest } from '@/sandbox/runner-types';
import type { TestRunResult } from '@/types/exercise';

/**
 * Grades React / React Native / JavaScript exercises.
 *
 * Exercises for these tracks share one file split by `// EXERCISE N:` banners,
 * so the learner's block is spliced back into the full stub before running —
 * the spec imports the module as a whole and the other exports must still exist.
 *
 * The work is split across the origin boundary: this side reassembles,
 * loop-guards and transpiles (so a compile error is reported with the context
 * the learner needs), and an isolated frame executes. See `isolated-frame.ts`
 * for why the frame is shaped the way it is.
 */

/**
 * How long the main thread may stay busy inside loops without yielding before
 * the code is judged stuck. Any real exercise yields far more often than this.
 */
const LOOP_STALL_BUDGET_MS = 2_000;

/** Strip the learner's import lines; the reassembled file supplies its own. */
function stripImports(code: string): string {
  const lines = code.split('\n');
  const result: string[] = [];
  let skipping = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('import ')) {
      // A multi-line import continues until the line carrying `from '...'`.
      skipping = !trimmed.includes(';') && !trimmed.includes("'") && !trimmed.includes('"');
      continue;
    }
    if (skipping) {
      if (trimmed.includes(';') || trimmed.includes("from '") || trimmed.includes('from "')) {
        skipping = false;
      }
      continue;
    }
    result.push(line);
  }

  while (result.length > 0 && result[0].trim() === '') result.shift();
  return result.join('\n');
}

export const reactBrowserRunner: ExerciseRunner = {
  id: 'react-browser',

  async run({
    userCode,
    moduleSource,
    spec,
    exerciseNumber,
    timeoutMs,
  }: ExerciseRunRequest): Promise<TestRunResult> {
    const assembled = reassembleFullCode(moduleSource, exerciseNumber, stripImports(userCode));

    // The guard turns a runaway loop into a failed test instead of a frozen
    // tab. Its budget measures *time without the thread yielding*, not total
    // run time, so it can be short without penalising a slow-but-honest run —
    // see loop-guard.ts.
    const guarded = await withLoopGuard(
      assembled,
      LOOP_STALL_BUDGET_MS,
      'Your code ran too long — check for a loop that never ends.'
    );

    // Transpiling here rather than in the frame keeps Sucrase out of the
    // sandbox bundle, and lets a compile error name which file it came from.
    let compiledUser: string;
    let compiledSpec: string;
    try {
      compiledUser = await transpile(guarded, 'index.tsx');
    } catch (e) {
      return failureResult('Compilation Error in your code', e);
    }
    try {
      compiledSpec = await transpile(spec, 'index.test.tsx');
    } catch (e) {
      return failureResult('Compilation Error in test file', e);
    }

    let frame: { result: Promise<TestRunResult>; dispose: () => void };
    try {
      frame = await runInIsolatedFrame({
        userCode: compiledUser,
        spec: compiledSpec,
        exerciseNumber,
        timeoutMs,
      });
    } catch (e) {
      return failureResult('Could not start the exercise runner', e);
    }

    // Covers everything the loop guard cannot: a runaway `setInterval`, a
    // promise that never settles, an `await` on a request that hangs. Unlike
    // the old in-page race, `dispose()` in the `finally` actually ends the
    // work — tearing down the frame takes its timers and promises with it.
    let watchdog: number | undefined;
    const deadline = new Promise<TestRunResult>((resolve) => {
      watchdog = window.setTimeout(
        () => resolve(failureResult('Timed out', `Tests did not finish within ${timeoutMs}ms.`)),
        timeoutMs
      );
    });

    try {
      return await Promise.race([frame.result, deadline]);
    } catch (e) {
      return failureResult('Could not run tests', e);
    } finally {
      if (watchdog !== undefined) window.clearTimeout(watchdog);
      frame.dispose();
    }
  },
};
