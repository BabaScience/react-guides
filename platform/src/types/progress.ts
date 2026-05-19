import type { TestRunResult } from './exercise';

export type ExerciseStatus = 'locked' | 'available' | 'in-progress' | 'passed';

export interface ExerciseProgress {
  status: ExerciseStatus;
  userCode: string;
  testResults: TestRunResult | null;
  completedAt: string | null;
  /**
   * Set when the user marked the exercise complete via the "Mark as completed
   * manually" escape hatch — typically because the in-browser test runner
   * itself is buggy in production and they don't want to be blocked. We still
   * promote status to 'passed' so the rest of the UI (counters, progress bar,
   * checkmarks) treats it like a real pass.
   */
  completedManually?: boolean;
}

export interface ProgressState {
  exercises: Record<string, ExerciseProgress>;
}
