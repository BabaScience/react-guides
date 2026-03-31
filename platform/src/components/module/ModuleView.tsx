import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getModule } from '@/data/modules';
import { useProgressStore } from '@/store/progress-store';
import { StepTimeline } from './StepTimeline';

export function ModuleView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const mod = id ? getModule(id) : undefined;
  const isUnlocked = useProgressStore((s) => id ? s.isModuleUnlocked(id) : false);
  const { completed, total } = useProgressStore((s) => id ? s.getStepProgress(id) : { completed: 0, total: 0 });
  const isStepComplete = useProgressStore((s) => s.isStepComplete);

  if (!mod) return <Navigate to="/" replace />;
  if (!isUnlocked) return <Navigate to="/" replace />;

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
          <span>{t('dashboard.modules')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{mod.name}</h1>
        <p className="text-gray-500 dark:text-gray-400">{mod.description}</p>
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
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            {completed === 0 ? t('nav.startLearning') : t('nav.continue')}
          </Link>
        )}
        {allComplete && (
          <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-lg flex-shrink-0">
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
