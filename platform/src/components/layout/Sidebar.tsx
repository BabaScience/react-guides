import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getModulesByTrack } from '@/data/modules';
import { useProgressStore } from '@/store/progress-store';
import { useUIStore } from '@/store/ui-store';
import type { Track } from '@/types/exercise';

const trackConfig: Record<Track, { icon: string; label: string }> = {
  react: { icon: '⚛️', label: 'React' },
  'react-native': { icon: '📱', label: 'React Native' },
};

export function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const activeTrack = useUIStore((s) => s.activeTrack);
  const setActiveTrack = useUIStore((s) => s.setActiveTrack);
  const getStepProgress = useProgressStore((s) => s.getStepProgress);
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);

  const trackModules = getModulesByTrack(activeTrack);

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-200 overflow-hidden`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-xl">{trackConfig[activeTrack].icon}</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              {trackConfig[activeTrack].label}
            </span>
          </NavLink>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {!collapsed && (
        <div className="px-2 pt-2 pb-1 flex gap-1">
          {(Object.keys(trackConfig) as Track[]).map((track) => (
            <button
              key={track}
              onClick={() => setActiveTrack(track)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTrack === track
                  ? 'bg-primary-100 dark:bg-primary-600/20 text-primary-700 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{trackConfig[track].icon}</span>
              <span>{trackConfig[track].label}</span>
            </button>
          ))}
        </div>
      )}

      {collapsed && (
        <div className="px-1 pt-2 pb-1 flex flex-col gap-1 items-center">
          {(Object.keys(trackConfig) as Track[]).map((track) => (
            <button
              key={track}
              onClick={() => setActiveTrack(track)}
              className={`p-1.5 rounded-md text-sm transition-colors ${
                activeTrack === track
                  ? 'bg-primary-100 dark:bg-primary-600/20'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={trackConfig[track].label}
            >
              {trackConfig[track].icon}
            </button>
          ))}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2">
        {trackModules.map((mod) => {
          const stepProgress = getStepProgress(mod.id);
          const exProgress = getModuleProgress(mod.id);
          const hasSteps = mod.steps.length > 0;
          const passed = hasSteps ? stepProgress.completed : exProgress.passed;
          const total = hasSteps ? stepProgress.total : exProgress.total;
          const isComingSoon = mod.status === 'coming-soon';
          const progressPct = total > 0 ? (passed / total) * 100 : 0;

          return (
            <NavLink
              key={mod.id}
              to={`/module/${mod.id}`}
              className={({ isActive }) =>
                `block px-4 py-3 mx-2 my-0.5 rounded-lg text-sm transition-colors ${
                  isComingSoon
                    ? isActive
                      ? 'opacity-70 bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                      : 'opacity-60 text-gray-500 dark:text-gray-400 hover:opacity-90 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : isActive
                      ? 'bg-primary-100 dark:bg-primary-600/20 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {collapsed ? (
                <span className="flex items-center justify-center font-mono text-xs">
                  {String(mod.number).padStart(2, '0')}
                </span>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      <span className="text-gray-400 dark:text-gray-500 mr-1 font-mono text-xs">
                        {String(mod.number).padStart(2, '0')}
                      </span>
                      {t(`modules.${mod.id}.name`, mod.name)}
                    </span>
                    {isComingSoon && (
                      <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                        {t('module.soon')}
                      </span>
                    )}
                  </div>
                  {!isComingSoon && total > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {passed}/{total}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
