import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getModule, getModulesByTrack } from '@/data/modules';
import { useProgressStore } from '@/store/progress-store';
import { useUIStore } from '@/store/ui-store';
import { ModuleMeta } from '@/components/progress/ModuleMeta';
import type { Module } from '@/types/exercise';
import { StepTimeline } from './StepTimeline';

/**
 * What this module assumes you already know, and whether you have it.
 *
 * Shown rather than enforced. The point is to answer "am I ready for this?" —
 * and to make the honest answer visible for someone who arrived from a search
 * or a link rather than by working through the track in order. Nothing is
 * locked: a reader who already knows hooks from elsewhere is not our problem
 * to gatekeep.
 */
function Prerequisites({ module: mod }: { module: Module }) {
  const { t } = useTranslation();
  const stepProgress = useProgressStore((s) => s.getStepProgress);

  if (!mod.prerequisites?.length) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400">{t('module.prerequisites')}</span>
      {mod.prerequisites.map((id) => {
        const prereq = getModule(id);
        if (!prereq) return null;
        const { completed, total } = stepProgress(id);
        const done = total > 0 && completed === total;
        return (
          <Link
            key={id}
            to={`/module/${id}`}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              done
                ? 'border-emerald-300 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-400'
                : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            {done && <span aria-hidden="true">✓ </span>}
            {t(`modules.${id}.name`)}
            {/* `status.complete` rather than `module.complete`: the latter has a
                ✓ baked into the string, which a screen reader would read out. */}
            {done && <span className="sr-only"> — {t('status.complete')}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function ModuleView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const mod = id ? getModule(id) : undefined;
  const setActiveTrack = useUIStore((s) => s.setActiveTrack);

  useEffect(() => {
    if (mod) setActiveTrack(mod.track);
  }, [mod, setActiveTrack]);
  // We intentionally do NOT gate navigation on `isModuleUnlocked` here.
  // Coming-soon modules have empty `steps[]` / `exercises[]` and the JSX
  // below already renders the "coming soon" message in that case — landing
  // the user there is friendlier than bouncing back to the dashboard.
  const { completed, total } = useProgressStore((s) => id ? s.getStepProgress(id) : { completed: 0, total: 0 });
  const isStepComplete = useProgressStore((s) => s.isStepComplete);

  if (!mod) return <Navigate to="/" replace />;

  const progressPct = total > 0 ? (completed / total) * 100 : 0;
  const firstIncompleteIndex = mod.steps.findIndex(
    (step) => !isStepComplete(mod.id, step.id)
  );
  const startStepIndex = firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;
  const allComplete = firstIncompleteIndex === -1 && total > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="font-mono">{String(mod.number).padStart(2, '0')}</span>
          <span>/</span>
          <span>{t('dashboard.modules', { count: mod ? getModulesByTrack(mod.track).length : 0 })}</span>
        </div>
        <h1 className="font-display text-2xl text-gray-900 dark:text-white mb-2">
          {t(`modules.${mod.id}.name`)}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t(`modules.${mod.id}.description`)}
        </p>
        <ModuleMeta module={mod} className="mt-3" />
        <Prerequisites module={mod} />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">{t('module.progress')}</span>
            <span className="text-gray-700 dark:text-gray-300">
              {t('module.steps', { completed, total })}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${allComplete ? 'bg-emerald-500' : 'bg-primary-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        {!allComplete && mod.steps.length > 0 && (
          <Link
            to={`/module/${mod.id}/step/${startStepIndex}`}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-700 text-white dark:bg-gray-100 dark:hover:bg-gray-300 dark:text-gray-900 text-sm font-medium rounded-full transition-colors flex-shrink-0"
          >
            {completed === 0 ? t('nav.startLearning') : t('nav.continue')}
          </Link>
        )}
        {allComplete && (
          <span className="px-5 py-2 bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full flex-shrink-0">
            {t('module.complete')}
          </span>
        )}
      </div>

      {mod.steps.length > 0 ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('module.learningPath')}</h2>
          </div>
          <div className="p-4">
            <StepTimeline module={mod} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {t('module.comingSoonMessage')}
        </div>
      )}
    </div>
  );
}
