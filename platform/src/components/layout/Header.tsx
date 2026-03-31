import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore, type Language } from '@/store/ui-store';
import { modules } from '@/data/modules';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const theme = useUIStore((s) => s.theme);
  const language = useUIStore((s) => s.language);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setLanguage = useUIStore((s) => s.setLanguage);

  const crumbs = buildBreadcrumbs(location.pathname, t);

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <header className="h-12 flex-shrink-0 bg-white/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
      <nav className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-800 dark:text-gray-200">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-1">
        {/* Language selector */}
        <div className="relative group">
          <button className="px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
            <span>{currentLang.flag}</span>
            <span className="text-xs">{currentLang.code.toUpperCase()}</span>
          </button>
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px]">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  lang.code === language
                    ? 'text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

interface Crumb {
  label: string;
  href?: string;
}

function buildBreadcrumbs(pathname: string, t: (key: string) => string): Crumb[] {
  const crumbs: Crumb[] = [{ label: t('nav.home'), href: '/' }];

  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'module' && parts[1]) {
    const mod = modules.find((m) => m.id === parts[1]);
    if (mod) {
      crumbs.push({
        label: `${String(mod.number).padStart(2, '0')} ${mod.name}`,
        href: `/module/${mod.id}`,
      });

      if (parts[2] === 'lesson') {
        crumbs.push({ label: t('step.lesson') });
      } else if (parts[2] === 'exercise' && parts[3]) {
        const ex = mod.exercises.find((e) => e.id === parts[3]);
        if (ex) {
          crumbs.push({ label: `${t('step.exercise')} ${ex.number}: ${ex.name}` });
        }
      } else if (parts[2] === 'step' && parts[3]) {
        const stepIdx = parseInt(parts[3]);
        const step = mod.steps[stepIdx];
        if (step) {
          crumbs.push({ label: step.title });
        }
      }
    }
  }

  return crumbs;
}
