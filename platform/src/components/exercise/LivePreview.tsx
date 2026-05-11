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
import { extractExampleProps } from '@/sandbox/preview-props-extractor';

interface LivePreviewProps {
  code: string;
  componentName: string;
  /** Test source — used to pull example props so components with required
   *  props render with realistic data instead of `undefined` everywhere. */
  testSource?: string;
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
export function LivePreview({ code, componentName, testSource }: LivePreviewProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);
  const [status, setStatus] = useState<'idle' | 'compiling' | 'ok' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [exampleProps, setExampleProps] = useState<Record<string, unknown>>({});
  // The props actually passed to the rendered component. Starts as a clone of
  // exampleProps, but the user can edit them via the Props panel below.
  const [currentProps, setCurrentProps] = useState<Record<string, unknown>>({});
  const [showProps, setShowProps] = useState(true);

  // Pull example props from the test file so the preview renders something
  // meaningful even when the component requires props.
  useEffect(() => {
    let cancelled = false;
    if (!testSource) {
      setExampleProps({});
      setCurrentProps({});
      return;
    }
    extractExampleProps(testSource, componentName)
      .then((p) => {
        if (cancelled) return;
        setExampleProps(p);
        setCurrentProps(p);
      })
      .catch(() => {
        if (cancelled) return;
        setExampleProps({});
        setCurrentProps({});
      });
    return () => { cancelled = true; };
  }, [testSource, componentName]);

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
            <Component {...(currentProps as Record<string, unknown>)} />
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
  }, [code, componentName, currentProps, t]);

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

  const propNames = Object.keys(currentProps);
  const hasProps = propNames.length > 0;

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

      {hasProps && (
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400">
            <button
              onClick={() => setShowProps((s) => !s)}
              className="flex-1 text-left font-medium uppercase tracking-wide hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {showProps ? '▾' : '▸'} {t('preview.props')} ({propNames.length})
            </button>
            <button
              onClick={() => setCurrentProps(exampleProps)}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('preview.reset')}
            </button>
          </div>
          {showProps && (
            <PropsEditor
              props={currentProps}
              onChange={(name, value) => setCurrentProps((p) => ({ ...p, [name]: value }))}
            />
          )}
        </div>
      )}

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

// --- PropsEditor -----------------------------------------------------------

/**
 * Editable controls for the live preview's props. Picks a control based on the
 * value's runtime type:
 *   string  → <input type="text">
 *   number  → <input type="number">
 *   boolean → checkbox
 *   function → read-only "ƒ (stub)" label
 *   array/object → JSON <textarea>
 */
function PropsEditor({
  props,
  onChange,
}: {
  props: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}) {
  return (
    <div className="px-4 py-2 space-y-1.5 bg-gray-50 dark:bg-gray-900/30 max-h-56 overflow-y-auto">
      {Object.entries(props).map(([name, value]) => (
        <PropControl
          key={name}
          name={name}
          value={value}
          onChange={(v) => onChange(name, v)}
        />
      ))}
    </div>
  );
}

function PropControl({
  name,
  value,
  onChange,
}: {
  name: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const labelClass = 'w-24 shrink-0 text-xs font-mono text-gray-600 dark:text-gray-400';
  const inputBase =
    'flex-1 min-w-0 text-xs font-mono px-2 py-1 rounded border bg-white dark:bg-gray-950 ' +
    'border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 ' +
    'focus:outline-none focus:ring-1 focus:ring-primary-500';

  if (typeof value === 'string') {
    return (
      <div className="flex items-center gap-2">
        <label className={labelClass}>{name}</label>
        <input
          className={inputBase}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
  if (typeof value === 'number') {
    return (
      <div className="flex items-center gap-2">
        <label className={labelClass}>{name}</label>
        <input
          type="number"
          className={inputBase}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => {
            const n = e.target.value === '' ? 0 : Number(e.target.value);
            onChange(Number.isNaN(n) ? value : n);
          }}
        />
      </div>
    );
  }
  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <span className={labelClass}>{name}</span>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-primary-500"
        />
        <span className="text-xs font-mono text-gray-500">{String(value)}</span>
      </label>
    );
  }
  if (typeof value === 'function') {
    return (
      <div className="flex items-center gap-2">
        <label className={labelClass}>{name}</label>
        <span className="text-xs font-mono text-gray-400 italic">ƒ (stub)</span>
      </div>
    );
  }
  // arrays + objects → JSON textarea
  return <JsonControl name={name} value={value} onChange={onChange} />;
}

function JsonControl({
  name,
  value,
  onChange,
}: {
  name: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [draft, setDraft] = useState(() => JSON.stringify(value, null, 2));
  const [err, setErr] = useState<string | null>(null);

  // Re-sync the textarea when the parent value changes (e.g. on Reset).
  useEffect(() => {
    setDraft(JSON.stringify(value, null, 2));
    setErr(null);
  }, [value]);

  return (
    <div className="flex items-start gap-2">
      <label className="w-24 shrink-0 text-xs font-mono text-gray-600 dark:text-gray-400 pt-1">
        {name}
      </label>
      <div className="flex-1 min-w-0">
        <textarea
          className={
            'w-full text-xs font-mono px-2 py-1 rounded border bg-white dark:bg-gray-950 ' +
            'text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500 ' +
            (err
              ? 'border-amber-400 dark:border-amber-700'
              : 'border-gray-300 dark:border-gray-700')
          }
          rows={Math.min(8, draft.split('\n').length)}
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            try {
              const parsed = JSON.parse(next);
              setErr(null);
              onChange(parsed);
            } catch (parseErr) {
              setErr(parseErr instanceof Error ? parseErr.message : String(parseErr));
            }
          }}
        />
        {err && (
          <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 font-mono">
            {err}
          </div>
        )}
      </div>
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
