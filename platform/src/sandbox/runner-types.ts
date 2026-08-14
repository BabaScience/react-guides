import type { TestRunResult } from '@/types/exercise';

/**
 * Which engine grades a track's exercises.
 *
 * The platform's grading pipeline was React-in-a-browser and nothing else:
 * Sucrase → eval → a hand-written Jest clone → @testing-library/react. That is
 * fine for three JavaScript-family tracks and impossible for the rest — Node
 * needs a Node runtime, Python needs CPython, and a GIS track is mostly a map,
 * not a test runner. Adding those tracks without this indirection would mean
 * shipping them read-only.
 */
/**
 * `quiz` was listed here when this interface was sketched. Building it showed
 * the mistake: a quiz isn't graded by running code, so it would have needed a
 * fake code-shaped request. It is its own step type instead — see `QuizStep`.
 */
export type RunnerId =
  | 'react-browser'
  | 'node-webcontainer'
  | 'python-pyodide'
  | 'map-interactive';

export interface ExerciseRunRequest {
  /** The learner's code for this exercise, as it appears in the editor. */
  userCode: string;
  /**
   * The whole stub file the exercise block came from. Runners whose exercises
   * share a file (the `// EXERCISE N:` convention) reassemble against it so the
   * spec's other imports still resolve.
   */
  moduleSource: string;
  /** The spec the learner's code is graded against. */
  spec: string;
  /** Which exercise inside the file/spec to run. */
  exerciseNumber: number;
  /**
   * Wall-clock budget. A runner must resolve with a failed `TestRunResult`
   * rather than hang past this.
   */
  timeoutMs: number;
}

export interface ExerciseRunner {
  id: RunnerId;
  /**
   * Grade one exercise. Implementations resolve with a result — including for
   * compile errors and timeouts — and reject only on programmer error.
   */
  run(request: ExerciseRunRequest): Promise<TestRunResult>;
}

/** Build the single-case failure result used for compile errors and timeouts. */
export function failureResult(name: string, error: unknown): TestRunResult {
  return {
    timestamp: Date.now(),
    passed: 0,
    failed: 1,
    total: 1,
    cases: [
      {
        name,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        duration: 0,
      },
    ],
  };
}
