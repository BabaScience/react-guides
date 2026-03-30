import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExerciseProgress, ExerciseStatus } from '@/types/progress';
import type { TestRunResult } from '@/types/exercise';
import { modules } from '@/data/modules';

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
        const mod = modules.find((m) => m.id === moduleId);
        if (!mod) return 'locked';

        const exercise = mod.exercises.find((e) => e.id === exerciseId);
        if (!exercise) return 'locked';

        // Check if module is unlocked
        if (!get().isModuleUnlocked(moduleId)) return 'locked';

        // First exercise in module is always available when module is unlocked
        if (exercise.number === 1) {
          const progress = get().exercises[getKey(moduleId, exerciseId)];
          return progress?.status === 'passed' ? 'passed' : 'available';
        }

        // Check if previous exercise is passed
        const prevExercise = mod.exercises.find((e) => e.number === exercise.number - 1);
        if (prevExercise) {
          const prevProgress = get().exercises[getKey(moduleId, prevExercise.id)];
          if (prevProgress?.status !== 'passed') return 'locked';
        }

        const progress = get().exercises[getKey(moduleId, exerciseId)];
        return progress?.status === 'passed' ? 'passed' : 'available';
      },

      isModuleUnlocked: (moduleId) => {
        const mod = modules.find((m) => m.id === moduleId);
        if (!mod) return false;

        // Module 1 is always unlocked
        if (mod.number === 1) return true;

        // Find previous module
        const prevModule = modules.find((m) => m.number === mod.number - 1);
        if (!prevModule || prevModule.status === 'coming-soon') return false;
        if (prevModule.exercises.length === 0) return false;

        // All exercises in previous module must be passed
        return prevModule.exercises.every((ex) => {
          const progress = get().exercises[getKey(prevModule.id, ex.id)];
          return progress?.status === 'passed';
        });
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
        set((state) => ({
          exercises: {
            ...state.exercises,
            [key]: {
              ...defaultProgress,
              ...state.exercises[key],
              testResults: results,
              status: allPassed ? 'passed' : 'in-progress',
              completedAt: allPassed ? new Date().toISOString() : state.exercises[key]?.completedAt ?? null,
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
    { name: 'react-mastery-progress' }
  )
);
