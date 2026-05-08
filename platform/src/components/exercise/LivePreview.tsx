import {
  Component,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { preprocessTypeScript, transpile } from '@/sandbox/transpiler';

interface LivePreviewProps {
  code: string;
  componentName: string;
}

const DEBOUNCE_MS = 500;

/**
 * Live preview of the user's exercise component.
 * Transpiles the editor source on each (debounced) change and mounts the
 * named export into a sandboxed container with an error boundary around it.
 *
 * Components are rendered with no props — exercises that take required props
 * will render with `undefined` values, which is intentional: it lets the user
 * see the markup shape without us having to invent props per exercise.
 */
export function LivePreview({ code, componentName }: LivePreviewProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);
  const [status, setStatus] = useState<'idle' | 'compiling' | 'ok' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('compiling');

    const handle = window.setTimeout(async () => {
      if (cancelled) return;

      try {
        const processed = preprocessTypeScript(code);
        const compiled = await transpile(processed, 'index.tsx');
        if (cancelled || !containerRef.current) return;

        const moduleExports: Record<string, unknown> = {};
        const requireFn = (id: string): unknown => {
          if (id === 'react') return React;
          // Block other imports — preview is intentionally minimal.
          return {};
        };

        const wrapped = `
          (function(exports, require, module) {
            ${compiled}
          })
        `;
        const fn = (0, eval)(wrapped) as (
          exports: Record<string, unknown>,
          require: (id: string) => unknown,
          module: { exports: Record<string, unknown> }
        ) => void;

        const moduleObj = { exports: moduleExports };
        fn(moduleExports, requireFn, moduleObj);
        if (moduleObj.exports !== moduleExports) {
          Object.assign(moduleExports, moduleObj.exports);
        }

        const Component = moduleExports[componentName] as
          | React.ComponentType
          | undefined;

        if (typeof Component !== 'function') {
          setError(t('preview.notExported', { name: componentName }));
          setStatus('error');
          rootRef.current?.render(<></>);
          return;
        }

        if (!rootRef.current) {
          rootRef.current = createRoot(containerRef.current);
        }
        rootRef.current.render(
          <PreviewErrorBoundary key={code} fallbackLabel={t('preview.runtimeError')}>
            <Component />
          </PreviewErrorBoundary>
        );
        setError(null);
        setStatus('ok');
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [code, componentName, t]);

  // Unmount the React root when the LivePreview itself unmounts.
  useEffect(() => {
    return () => {
      const root = rootRef.current;
      rootRef.current = null;
      if (root) {
        // Defer unmount to avoid "synchronously unmount during render" warning
        // when React 18 is mid-commit on the parent tree.
        setTimeout(() => root.unmount(), 0);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs text-gray-500 font-mono">
          &lt;{componentName} /&gt;
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-600">
          {status === 'compiling' && t('preview.compiling')}
          {status === 'ok' && t('preview.live')}
          {status === 'error' && t('preview.error')}
        </span>
      </div>
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 font-mono whitespace-pre-wrap">
          {error}
        </div>
      )}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
}

interface BoundaryProps {
  children: ReactNode;
  fallbackLabel: string;
}

interface BoundaryState {
  error: Error | null;
}

class PreviewErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // swallow — error already captured in state and rendered below
  }

  render() {
    if (this.state.error) {
      return (
        <div className="text-xs text-red-700 dark:text-red-400 font-mono whitespace-pre-wrap">
          {this.props.fallbackLabel}: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}
