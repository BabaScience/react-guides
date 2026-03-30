import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

let mermaidReady: Promise<typeof import('mermaid')> | null = null;

function getMermaid() {
  if (!mermaidReady) {
    mermaidReady = import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          darkMode: true,
          background: '#111827',
          primaryColor: '#3b82f6',
          primaryTextColor: '#e5e7eb',
          lineColor: '#4b5563',
        },
      });
      return m;
    });
  }
  return mermaidReady;
}

let counter = 0;

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${++counter}`;

    getMermaid().then(async (m) => {
      if (cancelled || !ref.current) return;
      try {
        const { svg } = await m.default.render(id, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    });

    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <pre className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg overflow-x-auto">
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="my-4 flex justify-center overflow-x-auto [&_svg]:max-w-full"
    />
  );
}
