import { Link } from 'react-router-dom';
import type { Module, Step } from '@/types/exercise';
import { useProgressStore } from '@/store/progress-store';

interface StepTimelineProps {
  module: Module;
}

export function StepTimeline({ module }: StepTimelineProps) {
  const isStepComplete = useProgressStore((s) => s.isStepComplete);

  // Find first incomplete step index
  const firstIncomplete = module.steps.findIndex(
    (step) => !isStepComplete(module.id, step.id)
  );

  return (
    <div className="space-y-0">
      {module.steps.map((step, index) => {
        const complete = isStepComplete(module.id, step.id);
        const isCurrent = index === firstIncomplete;
        const isLocked = index > firstIncomplete && firstIncomplete !== -1;

        return (
          <StepItem
            key={step.id}
            step={step}
            index={index}
            moduleId={module.id}
            complete={complete}
            isCurrent={isCurrent}
            isLocked={isLocked}
            isLast={index === module.steps.length - 1}
          />
        );
      })}
    </div>
  );
}

interface StepItemProps {
  step: Step;
  index: number;
  moduleId: string;
  complete: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  isLast: boolean;
}

function StepItem({ step, index, moduleId, complete, isCurrent, isLocked, isLast }: StepItemProps) {
  const isExercise = step.type === 'exercise';

  const content = (
    <div className="flex items-start gap-3">
      {/* Connector line + dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
            complete
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : isCurrent
                ? isExercise
                  ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                  : 'bg-amber-600/20 border-amber-500 text-amber-400'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500'
          }`}
        >
          {complete ? '✓' : isExercise ? '⚡' : '📖'}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-8 ${complete ? 'bg-emerald-600/50' : 'bg-gray-200 dark:bg-gray-800'}`}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              complete
                ? 'text-gray-400 dark:text-gray-400'
                : isCurrent
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500'
            }`}
          >
            {step.title}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              isExercise
                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
            }`}
          >
            {isExercise ? 'Exercise' : 'Lesson'}
          </span>
          {complete && (
            <span className="text-[10px] text-emerald-500">Complete</span>
          )}
        </div>
      </div>
    </div>
  );

  if (isLocked) {
    return <div className="opacity-40 cursor-not-allowed pl-2">{content}</div>;
  }

  return (
    <Link
      to={`/module/${moduleId}/step/${index}`}
      className={`block pl-2 rounded-lg transition-colors ${
        isCurrent ? 'bg-primary-50 dark:bg-gray-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/20'
      }`}
    >
      {content}
    </Link>
  );
}
