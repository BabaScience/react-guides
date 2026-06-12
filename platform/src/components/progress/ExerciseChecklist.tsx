import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Module } from '@/types/exercise';
import { useProgressStore } from '@/store/progress-store';

interface ExerciseChecklistProps {
  module: Module;
}

export function ExerciseChecklist({ module }: ExerciseChecklistProps) {
  const { t } = useTranslation();
  const getExerciseStatus = useProgressStore((s) => s.getExerciseStatus);

  return (
    <div className="space-y-1">
      {module.exercises.map((ex) => {
        const status = getExerciseStatus(module.id, ex.id);
        const isLocked = status === 'locked';

        return (
          <Link
            key={ex.id}
            to={isLocked ? '#' : `/module/${module.id}/exercise/${ex.id}`}
            onClick={(e) => { if (isLocked) e.preventDefault(); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isLocked
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-gray-800/50'
            }`}
          >
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-mono border border-gray-700">
              {status === 'passed' ? (
                <span className="text-emerald-400">✓</span>
              ) : isLocked ? (
                <span className="text-gray-600">🔒</span>
              ) : (
                <span className="text-gray-500">{ex.number}</span>
              )}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {ex.name}
              </div>
              <div className="text-xs text-gray-500 truncate">{ex.description}</div>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                status === 'passed'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                  : status === 'in-progress'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                    : status === 'available'
                      ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      : 'bg-gray-100/50 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600'
              }`}
            >
              {status === 'passed' ? t('status.passed') : status === 'in-progress' ? t('status.inProgress') : status === 'available' ? t('status.start') : t('status.locked')}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
