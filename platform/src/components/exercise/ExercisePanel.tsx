import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '@/types/exercise';

interface ExercisePanelProps {
  exercise: Exercise;
  moduleId: string;
}

export function ExercisePanel({ exercise, moduleId }: ExercisePanelProps) {
  const { t } = useTranslation();
  const [showHints, setShowHints] = useState(false);

  // All learner-facing text comes from the locale files; the manifest carries
  // identity and wiring only. `validate-content.mjs` guarantees these keys
  // exist in every locale, so there is nothing to fall back to.
  const exKey = `exercises.${moduleId}.${exercise.id}`;
  const name = t(`${exKey}.name`);
  const description = t(`${exKey}.description`);
  const rawHints = t(`${exKey}.hints`, { returnObjects: true });
  // A malformed translation can yield a non-array; don't let it crash the panel.
  const hints: string[] = Array.isArray(rawHints) ? (rawHints as string[]) : [];

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full bg-white dark:bg-gray-950">
      <div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-mono">
          {t(`modules.${moduleId}.name`)} / {t('exercise.title', { number: exercise.number })}
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h2>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </p>

      <div>
        <button
          type="button"
          onClick={() => setShowHints(!showHints)}
          aria-expanded={showHints}
          aria-controls="exercise-hints"
          className="text-sm rounded-full text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950"
        >
          {showHints ? t('exercise.hideHints') : t('exercise.showHints', { count: hints.length })}
        </button>
        {showHints && hints.length > 0 && (
          <ul id="exercise-hints" className="mt-2 space-y-1">
            {hints.map((hint, i) => (
              <li key={i} className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                <span aria-hidden="true" className="text-primary-500 mt-0.5">
                  •
                </span>
                {hint}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
