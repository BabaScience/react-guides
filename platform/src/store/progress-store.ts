import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExerciseProgress, ExerciseStatus } from '@/types/progress';
import type { TestRunResult } from '@/types/exercise';
import { modules } from '@/data/modules';

/** Bump when the persisted shape changes, and add a `migrate` branch for it. */
const PROGRESS_STORE_VERSION = 1;

interface ProgressStore {
  exercises: Record<string, ExerciseProgress>;
  lessonSteps: Record<string, boolean>;
  getExerciseProgress: (moduleId: string, exerciseId: string) => ExerciseProgress;
  getExerciseStatus: (moduleId: string, exerciseId: string) => ExerciseStatus;
  isModuleUnlocked: (moduleId: string) => boolean;
  getModuleProgress: (moduleId: string) => { passed: number; total: number };
  getStepProgress: (moduleId: string) => { completed: number; total: number };
  isStepComplete: (moduleId: string, stepId: string) => boolean;
  isLessonComplete: (moduleId: string, stepId: string) => boolean;
  markLessonComplete: (moduleId: string, stepId: string) => void;
  saveCode: (moduleId: string, exerciseId: string, code: string) => void;
  saveTestResults: (moduleId: string, exerciseId: string, results: TestRunResult) => void;
  /**
   * Manually flip an exercise to `'passed'` — used by the "Mark as completed
   * manually" escape hatch when the in-browser test runner itself is acting
   * up (e.g. a production-only Vite/React-DOM regression) and the user is
   * confident their code is correct. Preserves the most recent testResults
   * so the panel can still show what actually happened.
   */
  markExerciseComplete: (moduleId: string, exerciseId: string) => void;
  resetExercise: (moduleId: string, exerciseId: string) => void;
}

const defaultProgress: ExerciseProgress = {
  status: 'available',
  userCode: '',
  testResults: null,
  completedAt: null,
};

function getKey(moduleId: string, exerciseId: string): string {
  return `${moduleId}/${exerciseId}`;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      exercises: {},
      lessonSteps: {},

      getExerciseProgress: (moduleId, exerciseId) => {
        return get().exercises[getKey(moduleId, exerciseId)] ?? defaultProgress;
      },

      getExerciseStatus: (moduleId, exerciseId) => {
        // We intentionally no longer gate exercise access on whether the
        // previous exercise passed. Originally we returned 'locked' to force
        // sequential progression, but that turned the in-browser test runner
        // into a single point of failure: when it had a production-only bug
        // (e.g. React 18's prod `act()` throwing), users with correct code
        // were stranded. Now `'locked'` only means "this exercise or its
        // module doesn't exist" — see also `isModuleUnlocked`.
        const mod = modules.find((m) => m.id === moduleId);
        if (!mod) return 'locked';

        const exercise = mod.exercises.find((e) => e.id === exerciseId);
        if (!exercise) return 'locked';

        if (!get().isModuleUnlocked(moduleId)) return 'locked';

        const progress = get().exercises[getKey(moduleId, exerciseId)];
        if (progress?.status === 'passed') return 'passed';
        if (progress?.status === 'in-progress') return 'in-progress';
        return 'available';
      },

      isModuleUnlocked: (moduleId) => {
        // Coming-soon modules are still hidden — there's nothing to show.
        // Everything else is reachable; we no longer require the previous
        // module to be fully passed (see comment in getExerciseStatus).
        const mod = modules.find((m) => m.id === moduleId);
        if (!mod) return false;
        if (mod.status === 'coming-soon') return false;
        return true;
      },

      getModuleProgress: (moduleId) => {
        const mod = modules.find((m) => m.id === moduleId);
        if (!mod) return { passed: 0, total: 0 };

        const passed = mod.exercises.filter((ex) => {
          const progress = get().exercises[getKey(moduleId, ex.id)];
          return progress?.status === 'passed';
        }).length;

        return { passed, total: mod.exercises.length };
      },

      getStepProgress: (moduleId) => {
        const mod = modules.find((m) => m.id === moduleId);
        if (!mod) return { completed: 0, total: 0 };

        const completed = mod.steps.filter((step) => {
          if (step.type === 'lesson') {
            return get().lessonSteps[getKey(moduleId, step.id)] === true;
          }
          const progress = get().exercises[getKey(moduleId, step.id)];
          return progress?.status === 'passed';
        }).length;

        return { completed, total: mod.steps.length };
      },

      isStepComplete: (moduleId, stepId) => {
        // Check lesson steps first
        if (get().lessonSteps[getKey(moduleId, stepId)] === true) return true;
        // Check exercise steps
        const progress = get().exercises[getKey(moduleId, stepId)];
        return progress?.status === 'passed';
      },

      isLessonComplete: (moduleId, stepId) => {
        return get().lessonSteps[getKey(moduleId, stepId)] === true;
      },

      markLessonComplete: (moduleId, stepId) => {
        const key = getKey(moduleId, stepId);
        set((state) => ({
          lessonSteps: { ...state.lessonSteps, [key]: true },
        }));
      },

      saveCode: (moduleId, exerciseId, code) => {
        const key = getKey(moduleId, exerciseId);
        set((state) => ({
          exercises: {
            ...state.exercises,
            [key]: {
              ...defaultProgress,
              ...state.exercises[key],
              userCode: code,
              status: state.exercises[key]?.status === 'passed' ? 'passed' : 'in-progress',
            },
          },
        }));
      },

      saveTestResults: (moduleId, exerciseId, results) => {
        const key = getKey(moduleId, exerciseId);
        const allPassed = results.failed === 0 && results.total > 0;
        set((state) => {
          const prev = state.exercises[key];
          // Don't demote a manually-completed exercise to 'in-progress' when
          // the user re-runs tests — they explicitly accepted the result and
          // should stay completed unless they reset the exercise.
          const wasManual = prev?.completedManually === true;
          const status = allPassed || wasManual ? 'passed' : 'in-progress';
          const completedAt = allPassed
            ? new Date().toISOString()
            : prev?.completedAt ?? null;
          return {
            exercises: {
              ...state.exercises,
              [key]: {
                ...defaultProgress,
                ...prev,
                testResults: results,
                status,
                completedAt,
              },
            },
          };
        });
      },

      markExerciseComplete: (moduleId, exerciseId) => {
        const key = getKey(moduleId, exerciseId);
        set((state) => ({
          exercises: {
            ...state.exercises,
            [key]: {
              ...defaultProgress,
              ...state.exercises[key],
              status: 'passed',
              completedManually: true,
              completedAt:
                state.exercises[key]?.completedAt ?? new Date().toISOString(),
            },
          },
        }));
      },

      resetExercise: (moduleId, exerciseId) => {
        const key = getKey(moduleId, exerciseId);
        set((state) => {
          const newExercises = { ...state.exercises };
          delete newExercises[key];
          return { exercises: newExercises };
        });
      },
    }),
    {
      name: 'react-mastery-progress',
      // This store holds the learner's saved code — the one thing in the app
      // that cannot be regenerated. A version stamp is what makes a future
      // shape change migratable instead of silently corrupting it.
      version: PROGRESS_STORE_VERSION,
      migrate: (persisted, version) => {
        if (version === 0) {
          // v0 had no stamp. Shape is unchanged; record where we started so
          // the next migration has a floor to work from.
          return persisted as ProgressStore;
        }
        return persisted as ProgressStore;
      },
    }
  )
);
