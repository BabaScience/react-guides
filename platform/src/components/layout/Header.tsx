import { useLocation, Link } from 'react-router-dom';
import { useUIStore } from '@/store/ui-store';
import { modules } from '@/data/modules';

export function Header() {
  const location = useLocation();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const crumbs = buildBreadcrumbs(location.pathname);

  return (
    <header className="h-12 flex-shrink-0 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between px-4">
      <nav className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-600">/</span>}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-200">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  );
}

interface Crumb {
  label: string;
  href?: string;
}

function buildBreadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Home', href: '/' }];

  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'module' && parts[1]) {
    const mod = modules.find((m) => m.id === parts[1]);
    if (mod) {
      crumbs.push({
        label: `${String(mod.number).padStart(2, '0')} ${mod.name}`,
        href: `/module/${mod.id}`,
      });

      if (parts[2] === 'lesson') {
        crumbs.push({ label: 'Lesson' });
      } else if (parts[2] === 'exercise' && parts[3]) {
        const ex = mod.exercises.find((e) => e.id === parts[3]);
        if (ex) {
          crumbs.push({ label: `Exercise ${ex.number}: ${ex.name}` });
        }
      }
    }
  }

  return crumbs;
}
