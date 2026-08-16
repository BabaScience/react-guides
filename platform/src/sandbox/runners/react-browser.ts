import { reassembleFullCode } from '@/sandbox/exercise-extractor';
import { withLoopGuard } from '@/sandbox/loop-guard';
import { transpile } from '@/sandbox/transpiler';
import { runInIsolatedFrame } from '@/sandbox/isolated-frame';
import { runTestsInSandbox } from '@/sandbox/test-runner';
import { failureResult, type ExerciseRunner, type ExerciseRunRequest } from '@/sandbox/runner-types';
import type { TestRunResult } from '@/types/exercise';

/**
 * Grades React / React Native / JavaScript exercises.
 *
 * Exercises for these tracks share one file split by `// EXERCISE N:` banners,
 * so the learner's block is spliced back into the full stub before running —
 * the spec imports the module as a whole and the other exports must still exist.
 *
 * There are two execution contexts, and this module chooses between them.
 *
 * By default the work is split across an origin boundary: this side
 * reassembles, loop-guards and transpiles (so a compile error is reported with
 * the context the learner needs), and an isolated frame executes — see
 * `isolated-frame.ts`.
 *
 * Specs that drive `user-event` cannot use that frame, because an opaque
 * origin is refused focus and `user-event` works entirely through focus. Those
 * run in the page instead, via `test-runner.ts`. It is the weaker arrangement
 * — learner code can reach `document` and `localStorage` there — and it is
 * confined to the specs that genuinely need it. See `needsFocus`.
 */

/**
 * How long the main thread may stay busy inside loops without yielding before
 * the code is judged stuck. Any real exercise yields far more often than this.
 */
const LOOP_STALL_BUDGET_MS = 2_000;

/**
 * Does *this exercise's* block drive the keyboard or pointer via `user-event`?
 *
 * It matters because of where the code can run. The isolated frame is on an
 * opaque origin, and **an opaque-origin frame is not allowed to take focus**:
 * `element.focus()` leaves `document.activeElement` at `BODY`. `user-event`
 * routes every interaction through focus, so inside the frame `user.type` is a
 * silent no-op — no value written, no re-render — and the spec fails with
 * assertions that look like the learner's bug rather than the runner's.
 * `fireEvent` is unaffected: it dispatches straight at the element.
 *
 * Granting `allow-same-origin` would fix focus and would also hand learner
 * code the app's origin and every byte of saved progress, which is the one
 * thing the frame exists to prevent. So the exercises that need focus run in
 * the page — the arrangement that shipped before the frame existed — and
 * everything else keeps the isolation.
 *
 * The check has to be per *exercise*, not per file. A module's exercises share
 * one spec file, and that file imports `user-event` at the top for whichever
 * block happens to need it. Testing the whole file sends every exercise in the
 * module down the weaker path — module 01 has eight, and only two type.
 */
function needsFocus(spec: string, exerciseNumber: number): boolean {
  const start = spec.search(
    new RegExp(`describe\\s*\\(\\s*['"\`]\\s*Exercise\\s+${exerciseNumber}\\b`, 'i')
  );
  if (start === -1) return /\buser(?:Event)?\s*\./.test(spec); // can't isolate it: be safe

  const rest = spec.slice(start + 1);
  const next = rest.search(/describe\s*\(\s*['"`]\s*Exercise\s+\d+\b/i);
  const block = next === -1 ? rest : rest.slice(0, next);

  // `userEvent.setup()`, `user.type(`, `user.click(`, `user.clear(` …
  return /\buser(?:Event)?\s*\./.test(block);
}

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

    // Which execution context grades this spec. See `needsFocus` for why the
    // isolated frame cannot run everything.
    const inPage = needsFocus(spec, exerciseNumber);

    // The guard turns a runaway loop into a failed test instead of a frozen
    // tab. Its budget measures *time without the thread yielding*, not total
    // run time, so it can be short without penalising a slow-but-honest run —
    // see loop-guard.ts.
    const guarded = await withLoopGuard(
      assembled,
      LOOP_STALL_BUDGET_MS,
      'Your code ran too long — check for a loop that never ends.'
    );

    // The in-page runner transpiles internally, so only the frame path needs
    // it done here — which also keeps Sucrase out of the sandbox bundle and
    // lets a compile error name the file it came from.
    let frame: { result: Promise<TestRunResult>; dispose: () => void } | null = null;
    let work: Promise<TestRunResult>;

    if (inPage) {
      work = runTestsInSandbox(guarded, spec, exerciseNumber);
    } else {
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
      work = frame.result;
    }

    // Covers everything the loop guard cannot: a runaway `setInterval`, a
    // promise that never settles, an `await` on a request that hangs.
    //
    // On the frame path `dispose()` genuinely ends the work — tearing down the
    // frame takes its timers and pending promises with it. In-page it remains
    // what it always was: the result is abandoned, not stopped. That is part of
    // what the fallback costs, and the loop guard is what keeps it survivable.
    let watchdog: number | undefined;
    const deadline = new Promise<TestRunResult>((resolve) => {
      watchdog = window.setTimeout(
        () => resolve(failureResult('Timed out', `Tests did not finish within ${timeoutMs}ms.`)),
        timeoutMs
      );
    });

    try {
      return await Promise.race([work, deadline]);
    } catch (e) {
      return failureResult('Could not run tests', e);
    } finally {
      if (watchdog !== undefined) window.clearTimeout(watchdog);
      frame?.dispose();
    }
  },
};
