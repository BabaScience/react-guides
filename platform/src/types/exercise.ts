export interface Exercise {
  id: string;
  number: number;
  name: string;
  componentName: string;
  description: string;
  /**
   * Optional English fallback. Hint text lives in the locale files
   * (`exercises.<module>.<exercise>.hints`) — that is the single source of
   * truth, and `scripts/validate-content.mjs` guarantees every exercise has
   * hints in every locale. Duplicating them here only creates drift.
   */
  hints?: string[];
}

export interface LessonStep {
  type: 'lesson';
  id: string;
  title: string;
  sectionHeading: string;
}

export interface ExerciseStep {
  type: 'exercise';
  id: string;
  title: string;
}

export type Step = LessonStep | ExerciseStep;

export type Track = 'react' | 'react-native' | 'javascript';

export interface Module {
  id: string;
  number: number;
  name: string;
  description: string;
  guideFile: string;
  exerciseDir: string;
  status: 'available' | 'coming-soon';
  track: Track;
  exercises: Exercise[];
  steps: Step[];
}

export interface TestCaseResult {
  name: string;
  status: 'passed' | 'failed';
  error?: string;
  duration: number;
}

export interface TestRunResult {
  timestamp: number;
  passed: number;
  failed: number;
  total: number;
  cases: TestCaseResult[];
}
