import { Suspense, lazy, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import type { CodeEditor } from './CodeEditor';

/**
 * Monaco is ~5 MB of JavaScript. Importing `CodeEditor` directly pulls all of
 * it into the eager entry chunk, so every reader downloads the editor before
 * the dashboard paints — even if they only ever read lessons. Loading it here
 * keeps it in its own chunk, fetched the first time an exercise opens.
 */
const LazyCodeEditor = lazy(() =>
  import('./CodeEditor').then((m) => ({ default: m.CodeEditor }))
);

export function CodeEditorLazy(props: ComponentProps<typeof CodeEditor>) {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center bg-white dark:bg-gray-950">
          <span className="animate-pulse text-sm text-gray-500">
            {t('exercise.loadingEditor')}
          </span>
        </div>
      }
    >
      <LazyCodeEditor {...props} />
    </Suspense>
  );
}
