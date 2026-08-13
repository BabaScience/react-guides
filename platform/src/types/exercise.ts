/**
 * An exercise as the manifest describes it: identity and wiring only.
 *
 * Name, description and hints live in the locale files
 * (`exercises.<module>.<exercise>.*`), which are the single source of truth for
 * every string a learner reads. `scripts/validate-content.mjs` guarantees each
 * one exists in all three locales, so components call `t()` without a fallback.
 * Carrying English copies here is what produced the hint drift the audit found.
 */
export interface Exercise {
  id: string;
  number: number;
  /** The symbol the spec imports, and what LivePreview mounts. */
  componentName: string;
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

import type { RunnerId } from '@/sandbox/runner-types';

export type Track = 'react' | 'react-native' | 'javascript';

export interface Module {
  id: string;
  number: number;
  guideFile: string;
  exerciseDir: string;
  status: 'available' | 'coming-soon';
  track: Track;
  /**
   * Which engine grades this module's exercises. Omitted means "the default for
   * the track" — see `src/sandbox/runners`. Declared per module rather than per
   * track so a single module can opt into a different one (a quiz, say) without
   * a new track.
   */
  runner?: RunnerId;
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
