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

/**
 * Steps carry identity and wiring only — the title a learner reads comes from
 * `steps.<module>.<step>` in the locale files, like every other visible string.
 */
export interface LessonStep {
  type: 'lesson';
  id: string;
  sectionHeading: string;
}

export interface ExerciseStep {
  type: 'exercise';
  id: string;
}

/**
 * A checkpoint. Deliberately *not* an `ExerciseRunner`: a quiz isn't graded by
 * running code, so routing it through the runner interface would have meant
 * inventing a code-shaped request for a form. It is its own step type.
 */
export interface QuizStep {
  type: 'quiz';
  id: string;
}

export type Step = LessonStep | ExerciseStep | QuizStep;

/** A localized string from a quiz file. `en` is always present. */
export type LocalizedText = { en: string } & Partial<Record<string, string>>;

export interface QuizOption {
  id: string;
  correct: boolean;
  text: LocalizedText;
}

export interface QuizQuestion {
  id: string;
  prompt: LocalizedText;
  /** True when more than one option is correct — derived, not authored. */
  multiple: boolean;
  options: QuizOption[];
  explanation: LocalizedText | null;
}

export interface Quiz {
  questions: QuizQuestion[];
}

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
  /**
   * True when `<exerciseDir>/solution.tsx` exists. Set by the manifest
   * compiler, so the app never has to probe the network to find out — a dev
   * server answers a missing path with index.html and a 200 (ANALYSIS §4.2b).
   */
  hasSolutions?: boolean;
  /** The module's checkpoint quiz, if `content/quizzes/<id>.yml` exists. */
  quiz?: Quiz;
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
