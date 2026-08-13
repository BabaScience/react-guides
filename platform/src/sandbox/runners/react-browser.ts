import { reassembleFullCode } from '@/sandbox/exercise-extractor';
import { withLoopGuard } from '@/sandbox/loop-guard';
import { runTestsInSandbox } from '@/sandbox/test-runner';
import { failureResult, type ExerciseRunner, type ExerciseRunRequest } from '@/sandbox/runner-types';
import type { TestRunResult } from '@/types/exercise';

/**
 * Grades React / React Native / JavaScript exercises in this page.
 *
 * Exercises for these tracks share one file split by `// EXERCISE N:` banners,
 * so the learner's block is spliced back into the full stub before running —
 * the spec imports the module as a whole and the other exports must still exist.
 *
 * Isolation note: execution is `(0, eval)` in the main window, not a sandbox.
 * That is acceptable while the only code being run is code the learner typed.
 * See `isolationLevel` below and PLAN.md for what changes that.
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

    // Covers everything the guard cannot: a runaway `setInterval`, a promise
    // that never settles, an `await` on a request that hangs.
    let watchdog: number | undefined;
    const deadline = new Promise<TestRunResult>((resolve) => {
      watchdog = window.setTimeout(
        () => resolve(failureResult('Timed out', `Tests did not finish within ${timeoutMs}ms.`)),
        timeoutMs
      );
    });

    try {
      return await Promise.race([runTestsInSandbox(guarded, spec, exerciseNumber), deadline]);
    } catch (e) {
      return failureResult('Could not run tests', e);
    } finally {
      if (watchdog !== undefined) window.clearTimeout(watchdog);
    }
  },
};
