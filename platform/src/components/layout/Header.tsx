import { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useUIStore, type Language } from '@/store/ui-store';
import { modules } from '@/data/modules';

/**
 * Language codes rather than flag emoji. Regional-indicator pairs don't render
 * as flags on Windows — the picker read "FR FR" — and a flag is the wrong
 * symbol for a language anyway (French is not only France).
 */
const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Français' },
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

  // The menu used to open on `group-hover` alone, so it was unreachable by
  // keyboard and invisible to screen readers. It is a real disclosure now.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950';

  return (
    <header className="h-12 flex-shrink-0 bg-white/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
      <nav aria-label={t('nav.breadcrumb')} className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span aria-hidden="true" className="text-gray-300 dark:text-gray-600">
                /
              </span>
            )}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className={`rounded-full px-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${focusRing}`}
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-gray-800 dark:text-gray-200">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-1">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={t('nav.changeLanguage', { language: currentLang.label })}
            className={`px-2.5 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${focusRing}`}
          >
            {currentLang.code.toUpperCase()}
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px] overflow-hidden"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={lang.code === language}
                  onClick={() => {
                    setLanguage(lang.code);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${focusRing} ${
                    lang.code === language
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span aria-hidden="true" className="font-mono text-[10px] w-5 text-gray-400 dark:text-gray-500">
                    {lang.code.toUpperCase()}
                  </span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${focusRing}`}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
      </div>
    </header>
  );
}

interface Crumb {
  label: string;
  href?: string;
}

function buildBreadcrumbs(pathname: string, t: TFunction): Crumb[] {
  const crumbs: Crumb[] = [{ label: t('nav.home'), href: '/' }];

  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'module' && parts[1]) {
    const mod = modules.find((m) => m.id === parts[1]);
    if (mod) {
      const modName = t(`modules.${mod.id}.name`);
      crumbs.push({
        label: `${String(mod.number).padStart(2, '0')} ${modName}`,
        href: `/module/${mod.id}`,
      });

      if (parts[2] === 'lesson') {
        crumbs.push({ label: t('step.lesson') });
      } else if (parts[2] === 'exercise' && parts[3]) {
        const ex = mod.exercises.find((e) => e.id === parts[3]);
        if (ex) {
          const exName = t(`exercises.${mod.id}.${ex.id}.name`);
          crumbs.push({ label: `${t('step.exercise')} ${ex.number}: ${exName}` });
        }
      } else if (parts[2] === 'step' && parts[3]) {
        const stepIdx = parseInt(parts[3], 10);
        const step = Number.isInteger(stepIdx) ? mod.steps[stepIdx] : undefined;
        if (step) {
          crumbs.push({ label: t(`steps.${mod.id}.${step.id}`) });
        }
      }
    }
  }

  return crumbs;
}
