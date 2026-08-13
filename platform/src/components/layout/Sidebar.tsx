import { useDeferredValue, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getModulesByTrack } from '@/data/modules';
import { useProgressStore } from '@/store/progress-store';
import { useUIStore } from '@/store/ui-store';
import { Badge } from '@/components/ui';
import { ProgressTransfer } from '@/components/progress/ProgressTransfer';
import type { Track } from '@/types/exercise';

const trackConfig: Record<Track, { icon: string; label: string }> = {
  javascript: { icon: '🟨', label: 'JavaScript' },
  react: { icon: '⚛️', label: 'React' },
  'react-native': { icon: '📱', label: 'React Native' },
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950';

export function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const activeTrack = useUIStore((s) => s.activeTrack);
  const setActiveTrack = useUIStore((s) => s.setActiveTrack);
  const getStepProgress = useProgressStore((s) => s.getStepProgress);
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);

  const trackModules = getModulesByTrack(activeTrack);
  const tracks = Object.keys(trackConfig) as Track[];

  // 57 modules today, ~120 once GIS/Node/Python land. A flat scrolling list
  // stops being navigable well before that, so the list is filterable.
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const visibleModules = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return trackModules;
    return trackModules.filter((mod) => {
      const name = t(`modules.${mod.id}.name`).toLowerCase();
      const description = t(`modules.${mod.id}.description`).toLowerCase();
      // Step titles too: "useReducer" should find the hooks module even though
      // the module name never says it.
      const steps = mod.steps.some((s) =>
        t(`steps.${mod.id}.${s.id}`, s.title).toLowerCase().includes(q)
      );
      return name.includes(q) || description.includes(q) || steps || mod.id.includes(q);
    });
  }, [trackModules, deferredQuery, t]);

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-200 overflow-hidden`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <NavLink to="/" className={`flex items-center gap-2 rounded-full ${FOCUS_RING}`}>
            <span aria-hidden="true" className="text-xl">
              {trackConfig[activeTrack].icon}
            </span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              {trackConfig[activeTrack].label}
            </span>
          </NavLink>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${FOCUS_RING}`}
        >
          <span aria-hidden="true">{collapsed ? '→' : '←'}</span>
        </button>
      </div>

      {/* Track switcher — a group of toggles, so each reports its pressed state
          rather than relying on colour alone. */}
      <div
        role="group"
        aria-label={t('sidebar.chooseTrack')}
        className={
          collapsed
            ? 'px-1 pt-2 pb-1 flex flex-col gap-1 items-center'
            : 'px-2 pt-2 pb-1 flex gap-1'
        }
      >
        {tracks.map((track) => {
          const isActive = activeTrack === track;
          return (
            <button
              key={track}
              type="button"
              onClick={() => setActiveTrack(track)}
              aria-pressed={isActive}
              aria-label={collapsed ? trackConfig[track].label : undefined}
              title={collapsed ? trackConfig[track].label : undefined}
              className={
                collapsed
                  ? `p-1.5 rounded-full text-sm transition-colors ${FOCUS_RING} ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-600/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  : `flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-colors ${FOCUS_RING} ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-600/20 text-primary-700 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
                    }`
              }
            >
              <span aria-hidden="true">{trackConfig[track].icon}</span>
              {!collapsed && <span>{trackConfig[track].label}</span>}
            </button>
          );
        })}
      </div>

      {!collapsed && (
        <div className="px-2 pb-2">
          <label htmlFor="module-search" className="sr-only">
            {t('sidebar.searchModules')}
          </label>
          <input
            id="module-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('sidebar.searchPlaceholder')}
            className="w-full px-3 py-1.5 text-xs rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950"
          />
        </div>
      )}

      <nav
        aria-label={t('sidebar.modulesIn', { track: trackConfig[activeTrack].label })}
        className="flex-1 overflow-y-auto py-2"
      >
        {!collapsed && query.trim() !== '' && (
          <p role="status" className="px-4 pb-2 text-[10px] text-gray-400 dark:text-gray-500">
            {t('sidebar.searchResults', { count: visibleModules.length })}
          </p>
        )}

        {visibleModules.map((mod) => {
          const stepProgress = getStepProgress(mod.id);
          const exProgress = getModuleProgress(mod.id);
          const hasSteps = mod.steps.length > 0;
          const passed = hasSteps ? stepProgress.completed : exProgress.passed;
          const total = hasSteps ? stepProgress.total : exProgress.total;
          const isComingSoon = mod.status === 'coming-soon';
          const progressPct = total > 0 ? (passed / total) * 100 : 0;
          const modName = t(`modules.${mod.id}.name`);

          return (
            <NavLink
              key={mod.id}
              to={`/module/${mod.id}`}
              aria-label={collapsed ? modName : undefined}
              title={collapsed ? modName : undefined}
              className={({ isActive }) =>
                `block px-4 py-3 mx-2 my-0.5 rounded-lg text-sm transition-colors ${FOCUS_RING} ${
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
                <span aria-hidden="true" className="flex items-center justify-center font-mono text-xs">
                  {String(mod.number).padStart(2, '0')}
                </span>
              ) : (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">
                      <span
                        aria-hidden="true"
                        className="text-gray-400 dark:text-gray-500 mr-1 font-mono text-xs"
                      >
                        {String(mod.number).padStart(2, '0')}
                      </span>
                      {modName}
                    </span>
                    {isComingSoon && <Badge tone="neutral">{t('module.soon')}</Badge>}
                  </div>
                  {!isComingSoon && total > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div
                        role="progressbar"
                        aria-valuenow={passed}
                        aria-valuemin={0}
                        aria-valuemax={total}
                        aria-label={t('module.stepsCompletedIn', { module: modName })}
                        className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                      >
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span aria-hidden="true" className="text-[10px] text-gray-400 dark:text-gray-500">
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

      <ProgressTransfer collapsed={collapsed} />
    </aside>
  );
}
