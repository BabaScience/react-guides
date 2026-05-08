import { useState, useCallback, useRef } from 'react';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number;
}

export function SplitPane({ left, right, defaultSplit = 55 }: SplitPaneProps) {
  const [split, setSplit] = useState(defaultSplit);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback(() => {
    dragging.current = true;
    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(80, Math.max(20, pct)));
    };

    const stop = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('blur', stop);
    };

    // Listen on window so a mouseup outside the document (e.g. devtools) is caught,
    // and on blur so styles reset if the window loses focus mid-drag.
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('blur', stop);
  }, []);

  return (
    <div ref={containerRef} className="flex h-full">
      <div style={{ width: `${split}%` }} className="min-w-0 flex flex-col">
        {left}
      </div>
      <div
        onMouseDown={onMouseDown}
        className="w-1 bg-gray-200 dark:bg-gray-800 hover:bg-primary-500 cursor-col-resize flex-shrink-0 transition-colors"
      />
      <div style={{ width: `${100 - split}%` }} className="min-w-0 flex flex-col">
        {right}
      </div>
    </div>
  );
}
