export interface Exercise {
  id: string;
  number: number;
  name: string;
  componentName: string;
  description: string;
  hints: string[];
  angularEquivalent: string;
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

export interface Module {
  id: string;
  number: number;
  name: string;
  description: string;
  guideFile: string;
  exerciseDir: string;
  status: 'available' | 'coming-soon';
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
