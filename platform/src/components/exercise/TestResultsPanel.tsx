import { useTranslation } from 'react-i18next';
import type { TestRunResult } from '@/types/exercise';

interface TestResultsPanelProps {
  results: TestRunResult | null;
  running: boolean;
  onRun: () => void;
}

/**
 * Clean up an error message produced by the in-browser test harness or
 * @testing-library/react before showing it to the learner. Three concerns:
 *
 * 1. Strip the "Module execution error:" wrapper our sandbox prepends.
 * 2. Drop the long DOM dump Testing Library appends to its errors
 *    ("Here are the accessible roles", "Ignored nodes:", "<body>..." etc.) —
 *    keep only the headline that says what couldn't be found.
 * 3. Strip stack frames ("    at SomeFn (...)").
 * 4. Collapse runs of blank lines.
 */
function sanitizeError(raw: string | undefined): string | null {
  if (!raw) return null;
  let msg = raw.replace(/^Module execution error:\s*/i, '');

  // Cut everything from the first Testing-Library dump marker onward.
  const tlMarkers = [
    /\n\s*Here are the accessible roles:/,
    /\n\s*Ignored nodes:/,
    /\n\s*<body>/i,
    /\n\s*<div\b/i,
  ];
  for (const re of tlMarkers) {
    const m = msg.search(re);
    if (m !== -1) msg = msg.slice(0, m);
  }

  // Drop stack frames.
  msg = msg.replace(/^\s*at\s+.+$/gm, '');
  // Collapse blank lines.
  msg = msg.replace(/\n{3,}/g, '\n\n').trim();
  // Hard cap to keep the panel readable.
  if (msg.length > 400) msg = msg.slice(0, 400) + '…';
  return msg;
}

export function TestResultsPanel({ results, running, onRun }: TestResultsPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('exercise.testResults')}</h3>
        <button
          onClick={onRun}
          disabled={running}
          className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md transition-colors"
        >
          {running ? t('exercise.running') : t('exercise.runTests')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!results && !running && (
          <div className="text-center py-8">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {t('exercise.runPrompt')} <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+Enter</kbd> {t('exercise.toRun')}
            </p>
          </div>
        )}

        {running && (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">{t('exercise.runningTests')}</p>
          </div>
        )}

        {results && !running && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`text-2xl font-bold ${
                  results.failed === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {results.failed === 0 ? t('exercise.allPassed') : t('exercise.notYet', { count: results.failed })}
              </div>
              <div className="text-sm text-gray-500">
                {t('exercise.passing', { passed: results.passed, total: results.total })}
              </div>
            </div>

            {results.cases.map((tc, i) => {
              const cleanError = sanitizeError(tc.error);
              return (
                <div
                  key={i}
                  className={`border rounded-lg p-3 ${
                    tc.status === 'passed'
                      ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={tc.status === 'passed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                      {tc.status === 'passed' ? '✓' : '○'}
                    </span>
                    <span className="text-sm text-gray-800 dark:text-gray-200">{tc.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-600 ml-auto">{tc.duration}ms</span>
                  </div>
                  {tc.status === 'failed' && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        {t('exercise.didNotPass')}
                      </div>
                      {cleanError && (
                        <pre className="text-xs text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-black/20 p-2 rounded overflow-x-auto whitespace-pre-wrap font-mono">
                          {cleanError}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
