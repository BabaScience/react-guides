import { useParams, Navigate, Link } from 'react-router-dom';
import { getModule } from '@/data/modules';
import { useProgressStore } from '@/store/progress-store';
import { LessonStepView } from './LessonStepView';
import { ExerciseStepView } from './ExerciseStepView';

export function StepView() {
  const { id: moduleId, stepIndex: stepIndexStr } = useParams<{
    id: string;
    stepIndex: string;
  }>();

  const mod = moduleId ? getModule(moduleId) : undefined;
  const stepIndex = stepIndexStr ? parseInt(stepIndexStr) : -1;
  const isUnlocked = useProgressStore((s) => moduleId ? s.isModuleUnlocked(moduleId) : false);

  if (!mod || stepIndex < 0 || stepIndex >= mod.steps.length) {
    return <Navigate to="/" replace />;
  }
  if (!isUnlocked) return <Navigate to="/" replace />;

  const step = mod.steps[stepIndex];

  // Top navigation bar with step info
  return (
    <div className="h-full flex flex-col">
      {/* Step navigation bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Link
            to={`/module/${mod.id}`}
            className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Module
          </Link>
          <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Step {stepIndex + 1}/{mod.steps.length}
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {step.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {stepIndex > 0 && (
            <Link
              to={`/module/${mod.id}/step/${stepIndex - 1}`}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-700 rounded transition-colors"
            >
              ← Prev
            </Link>
          )}
          {stepIndex < mod.steps.length - 1 && (
            <Link
              to={`/module/${mod.id}/step/${stepIndex + 1}`}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-700 rounded transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {step.type === 'lesson' ? (
          <LessonStepView
            module={mod}
            step={step}
            stepIndex={stepIndex}
            totalSteps={mod.steps.length}
          />
        ) : (
          <ExerciseStepView
            module={mod}
            exerciseId={step.id}
            stepIndex={stepIndex}
            totalSteps={mod.steps.length}
          />
        )}
      </div>
    </div>
  );
}
