import { Link } from 'react-router-dom';
import type { Module } from '@/types/exercise';
import { useProgressStore } from '@/store/progress-store';

interface ExerciseChecklistProps {
  module: Module;
}

export function ExerciseChecklist({ module }: ExerciseChecklistProps) {
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
              <div className="text-sm font-medium text-gray-200 truncate">
                {ex.name}
              </div>
              <div className="text-xs text-gray-500 truncate">{ex.description}</div>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                status === 'passed'
                  ? 'bg-emerald-900/50 text-emerald-400'
                  : status === 'in-progress'
                    ? 'bg-yellow-900/50 text-yellow-400'
                    : status === 'available'
                      ? 'bg-gray-800 text-gray-400'
                      : 'bg-gray-800/50 text-gray-600'
              }`}
            >
              {status === 'passed' ? 'Passed' : status === 'in-progress' ? 'In Progress' : status === 'available' ? 'Start' : 'Locked'}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
