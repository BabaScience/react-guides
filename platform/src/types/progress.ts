import type { TestRunResult } from './exercise';

export type ExerciseStatus = 'locked' | 'available' | 'in-progress' | 'passed';

export interface ExerciseProgress {
  status: ExerciseStatus;
  userCode: string;
  testResults: TestRunResult | null;
  completedAt: string | null;
}

export interface ProgressState {
  exercises: Record<string, ExerciseProgress>;
}
