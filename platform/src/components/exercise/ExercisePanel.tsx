import { useState } from 'react';
import type { Exercise } from '@/types/exercise';

interface ExercisePanelProps {
  exercise: Exercise;
  moduleName: string;
}

export function ExercisePanel({ exercise, moduleName }: ExercisePanelProps) {
  const [showHints, setShowHints] = useState(false);

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full bg-gray-950">
      <div>
        <div className="text-xs text-gray-500 mb-1 font-mono">
          {moduleName} / Exercise {exercise.number}
        </div>
        <h2 className="text-lg font-bold text-white">{exercise.name}</h2>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed">
        {exercise.description}
      </p>

      {exercise.angularEquivalent && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <div className="text-xs font-semibold text-orange-400 mb-1">
            Angular Equivalent
          </div>
          <code className="text-xs text-gray-300">{exercise.angularEquivalent}</code>
        </div>
      )}

      <div>
        <button
          onClick={() => setShowHints(!showHints)}
          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          {showHints ? 'Hide Hints' : `Show Hints (${exercise.hints.length})`}
        </button>
        {showHints && (
          <ul className="mt-2 space-y-1">
            {exercise.hints.map((hint, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                {hint}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
