import { modules } from '@/data/modules';
import { useProgressStore } from '@/store/progress-store';
import { ModuleCard } from './ModuleCard';

export function ProgressDashboard() {
  const totalCompleted = modules.reduce((sum, mod) => {
    const { completed } = useProgressStore.getState().getStepProgress(mod.id);
    return sum + completed;
  }, 0);
  const totalSteps = modules.reduce((sum, mod) => sum + mod.steps.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">React Mastery</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Interactive learning platform for Angular developers transitioning to React
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{
                  width: `${totalSteps > 0 ? (totalCompleted / totalSteps) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalCompleted}/{totalSteps} steps completed
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <ModuleCard key={mod.id} module={mod} />
        ))}
      </div>
    </div>
  );
}
