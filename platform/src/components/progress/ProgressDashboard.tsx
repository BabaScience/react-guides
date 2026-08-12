import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getModulesByTrack } from '@/data/modules';
import { useProgressStore } from '@/store/progress-store';
import { useUIStore } from '@/store/ui-store';
import { ModuleCard } from './ModuleCard';
import type { Track } from '@/types/exercise';

const trackMeta: Record<Track, { icon: string; title: string; subtitle: string }> = {
  javascript: {
    icon: '🟨',
    title: 'JavaScript Mastery',
    subtitle: 'From zero to production-grade JavaScript — the language, the runtime, the ecosystem',
  },
  react: {
    icon: '⚛️',
    title: 'React Mastery',
    subtitle: 'Interactive learning platform for mastering React',
  },
  'react-native': {
    icon: '📱',
    title: 'React Native Mastery',
    subtitle: 'From React developer to production-grade mobile engineer',
  },
};

export function ProgressDashboard() {
  const { t } = useTranslation();
  const activeTrack = useUIStore((s) => s.activeTrack);
  const setActiveTrack = useUIStore((s) => s.setActiveTrack);
  const trackModules = getModulesByTrack(activeTrack);

  // Subscribe to the progress slices this view renders. Reading via
  // `useProgressStore.getState()` inside the reduce (as this used to) never
  // registers a subscription, so the bar sat stale until an unrelated
  // re-render happened to refresh it.
  const exercises = useProgressStore((s) => s.exercises);
  const lessonSteps = useProgressStore((s) => s.lessonSteps);

  const totalCompleted = useMemo(
    () =>
      trackModules.reduce(
        (sum, mod) =>
          sum +
          mod.steps.filter((step) =>
            step.type === 'lesson'
              ? lessonSteps[`${mod.id}/${step.id}`] === true
              : exercises[`${mod.id}/${step.id}`]?.status === 'passed'
          ).length,
        0
      ),
    [trackModules, exercises, lessonSteps]
  );
  const totalSteps = trackModules.reduce((sum, mod) => sum + mod.steps.length, 0);
  const meta = trackMeta[activeTrack];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {(Object.keys(trackMeta) as Track[]).map((track) => (
            <button
              key={track}
              onClick={() => setActiveTrack(track)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTrack === track
                  ? 'bg-primary-100 dark:bg-primary-600/20 text-primary-700 dark:text-primary-400 ring-1 ring-primary-300 dark:ring-primary-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{trackMeta[track].icon}</span>
              <span>{trackMeta[track].title.replace(' Mastery', '')}</span>
            </button>
          ))}
        </div>

        <h1 className="font-display text-3xl text-gray-900 dark:text-white mb-2">{meta.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{meta.subtitle}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${totalSteps > 0 ? (totalCompleted / totalSteps) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.stepsCompleted', { completed: totalCompleted, total: totalSteps })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {trackModules.map((mod) => (
          <ModuleCard key={mod.id} module={mod} />
        ))}
      </div>
    </div>
  );
}
