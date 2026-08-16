import { useTranslation } from 'react-i18next';
import type { Module } from '@/types/exercise';

/**
 * Difficulty and duration, the two facts a learner wants before committing to
 * a module. Shared by the dashboard card and the module header so the two
 * cannot drift apart.
 */

const DIFFICULTY_TONE: Record<string, string> = {
  beginner: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  intermediate: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  advanced: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
};

type TFunc = ReturnType<typeof useTranslation>['t'];

/**
 * "45 min" under an hour, "3h 05" above — nobody reads "220 min".
 *
 * Not exported: a non-component export costs this file its fast refresh. If
 * something else ever needs it, it moves to its own module.
 */
function formatDuration(minutes: number, t: TFunc): string {
  if (minutes < 60) return t('module.minutes', { count: minutes });
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return t('module.hours', { count: h });
  // Zero-padded: "3h 05", not "3h 5", which reads as a broken string.
  return t('module.hoursMinutes', { hours: h, minutes: String(m).padStart(2, '0') });
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
        DIFFICULTY_TONE[difficulty] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
      }`}
    >
      {t(`difficulty.${difficulty}`)}
    </span>
  );
}

export function ModuleMeta({ module, className = '' }: { module: Module; className?: string }) {
  const { t } = useTranslation();
  if (!module.difficulty && !module.estimatedMinutes) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {module.difficulty && <DifficultyBadge difficulty={module.difficulty} />}
      {module.estimatedMinutes ? (
        <span className="text-[11px] text-gray-500 dark:text-gray-400">
          {formatDuration(module.estimatedMinutes, t)}
        </span>
      ) : null}
    </div>
  );
}
