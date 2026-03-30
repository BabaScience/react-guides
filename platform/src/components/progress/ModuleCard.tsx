import { Link } from 'react-router-dom';
import type { Module } from '@/types/exercise';
import { useProgressStore } from '@/store/progress-store';

interface ModuleCardProps {
  module: Module;
}

const moduleIcons: Record<number, string> = {
  1: '🧱', 2: '🪝', 3: '🧩', 4: '🎨', 5: '🧭', 6: '📦',
  7: '🌐', 8: '📝', 9: '⚡', 10: '🧪', 11: '🔷', 12: '🚀',
};

export function ModuleCard({ module }: ModuleCardProps) {
  const { completed, total } = useProgressStore((s) => s.getStepProgress(module.id));
  const unlocked = useProgressStore((s) => s.isModuleUnlocked(module.id));
  const isComingSoon = module.status === 'coming-soon';
  const progressPct = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = completed === total && total > 0;

  const disabled = isComingSoon || !unlocked;

  const content = (
    <div
      className={`rounded-xl border p-5 transition-all h-full flex flex-col ${
        disabled
          ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 opacity-50'
          : isComplete
            ? 'border-emerald-300 dark:border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-500/50'
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary-300 dark:hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-gray-900/80'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{moduleIcons[module.number] ?? '📘'}</span>
        <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
          {String(module.number).padStart(2, '0')}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{module.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 mb-3">{module.description}</p>

      {isComingSoon ? (
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded-md self-start">
          Coming Soon
        </span>
      ) : !unlocked ? (
        <span className="text-xs text-gray-400 dark:text-gray-500">🔒 Complete previous module to unlock</span>
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400">
              {completed}/{total} steps
            </span>
            {isComplete && <span className="text-emerald-600 dark:text-emerald-400">Complete ✓</span>}
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

  if (disabled) return <div className="cursor-not-allowed">{content}</div>;

  return (
    <Link to={`/module/${module.id}`} className="block">
      {content}
    </Link>
  );
}
