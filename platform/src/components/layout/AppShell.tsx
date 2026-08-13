import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell() {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Keyboard users land here first: the sidebar is ~60 tab stops deep, so
          without this every page starts with a walk through the module list. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:px-5 focus:py-2 focus:rounded-full focus:text-sm focus:font-medium focus:bg-gray-900 focus:text-white dark:focus:bg-gray-100 dark:focus:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950"
      >
        {t('nav.skipToContent')}
      </a>

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
