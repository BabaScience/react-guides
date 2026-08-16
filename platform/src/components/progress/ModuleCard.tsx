import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Module } from '@/types/exercise';
import { useProgressStore } from '@/store/progress-store';
import { ModuleMeta } from '@/components/progress/ModuleMeta';

interface ModuleCardProps {
  module: Module;
}

const reactIcons: Record<number, string> = {
  1: '🧱', 2: '🪝', 3: '🧩', 4: '🎨', 5: '🧭', 6: '📦',
  7: '🌐', 8: '📝', 9: '⚡', 10: '🧪', 11: '🔷', 12: '🚀',
};

const rnIcons: Record<number, string> = {
  1: '✅', 2: '📱', 3: '🛠️', 4: '🧱', 5: '🎨', 6: '🧭',
  7: '📦', 8: '📝', 9: '🌐', 10: '📡', 11: '💾', 12: '✨',
  13: '⚡', 14: '🔧', 15: '🔐', 16: '🧪', 17: '🔔', 18: '📦',
  19: '🔄', 20: '📊', 21: '🚀',
};

const jsIcons: Record<number, string> = {
  1: '📋', 2: '🟨', 3: '🔢', 4: '🔀', 5: '⚙️', 6: '🧱',
  7: '📚', 8: '🔤', 9: '🔒', 10: '👆', 11: '🏗️', 12: '📦',
  13: '⏳', 14: '🚨', 15: '🔄', 16: '🌐', 17: '💚', 18: '✨',
  19: '🔷', 20: '🛠️', 21: '🧪', 22: '⚡', 23: '🛡️', 24: '🏛️',
};

const moduleIcons = (track: string, num: number) => {
  if (track === 'react-native') return rnIcons[num] ?? '📘';
  if (track === 'javascript') return jsIcons[num] ?? '📘';
  return reactIcons[num] ?? '📘';
};

export function ModuleCard({ module }: ModuleCardProps) {
  const { t } = useTranslation();
  const { completed, total } = useProgressStore((s) => s.getStepProgress(module.id));
  const isComingSoon = module.status === 'coming-soon';
  const progressPct = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = completed === total && total > 0;

  // Coming-soon cards are still clickable — they land on the module page
  // which renders a "not yet available" message. We keep a muted style so
  // they're visually distinct from in-progress modules.
  const content = (
    <div
      className={`rounded-xl border p-5 transition-all h-full flex flex-col ${
        isComingSoon
          ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 opacity-70 hover:opacity-90'
          : isComplete
            ? 'border-emerald-300 dark:border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/20 shadow-sm dark:shadow-none hover:border-emerald-400 dark:hover:border-emerald-500/50'
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm dark:shadow-none hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow dark:hover:bg-gray-900/80'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{moduleIcons(module.track, module.number)}</span>
        <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
          {String(module.number).padStart(2, '0')}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {t(`modules.${module.id}.name`)}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 mb-2">
        {t(`modules.${module.id}.description`)}
      </p>
      {!isComingSoon && <ModuleMeta module={module} className="mb-3" />}

      {isComingSoon ? (
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2.5 py-1 rounded-full self-start">
          {t('module.comingSoon')}
        </span>
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400">
              {t('module.steps', { completed, total })}
            </span>
            {isComplete && <span className="text-emerald-600 dark:text-emerald-400">{t('module.complete')}</span>}
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isComplete ? 'bg-emerald-500' : 'bg-primary-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Link to={`/module/${module.id}`} className="block">
      {content}
    </Link>
  );
}
