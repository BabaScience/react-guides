import { useEffect, useId, useRef, useState } from 'react';
import { useUIStore } from '@/store/ui-store';

interface MermaidDiagramProps {
  chart: string;
}

let mermaidModule: Promise<typeof import('mermaid')> | null = null;

function getMermaid() {
  if (!mermaidModule) {
    mermaidModule = import('mermaid');
  }
  return mermaidModule;
}

// "Paper & ink" theme variables. Mermaid is re-initialized per render so the
// diagram follows the app's light/dark toggle. Chapters should NOT hardcode
// node fills — leave styling to these variables so diagrams adapt to both modes.
const THEME_VARS = {
  light: {
    background: 'transparent',
    primaryColor: '#e0e7ff', // indigo-100
    primaryTextColor: '#3730a3', // indigo-800
    primaryBorderColor: '#6366f1', // indigo-500
    secondaryColor: '#f5f5f4', // stone-100
    tertiaryColor: '#faf9f6', // paper
    lineColor: '#a8a29e', // stone-400
    textColor: '#292524', // stone-800
    fontSize: '14px',
  },
  dark: {
    darkMode: true,
    background: 'transparent',
    primaryColor: '#312e81', // indigo-900
    primaryTextColor: '#e0e7ff', // indigo-100
    primaryBorderColor: '#818cf8', // indigo-400
    secondaryColor: '#292524', // stone-800
    tertiaryColor: '#1c1917', // stone-900 (ink)
    lineColor: '#78716c', // stone-500
    textColor: '#e7e5e4', // stone-200
    fontSize: '14px',
  },
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useUIStore((s) => s.theme);
  // Mermaid IDs must be valid CSS identifiers; useId() may contain colons.
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, '-');

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${reactId}-${theme}`;

    getMermaid().then(async (m) => {
      if (cancelled || !ref.current) return;
      try {
        // Re-initialize per render so the diagram re-themes on light/dark toggle.
        m.default.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'base',
          themeVariables: theme === 'dark' ? THEME_VARS.dark : THEME_VARS.light,
        });
        const { svg } = await m.default.render(id, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    });

    return () => { cancelled = true; };
  }, [chart, reactId, theme]);

  if (error) {
    return (
      <pre className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg overflow-x-auto">
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto [&_svg]:max-w-full"
    />
  );
}
