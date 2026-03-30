import type { TestRunResult } from '@/types/exercise';

interface TestResultsPanelProps {
  results: TestRunResult | null;
  running: boolean;
  onRun: () => void;
}

export function TestResultsPanel({ results, running, onRun }: TestResultsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Test Results</h3>
        <button
          onClick={onRun}
          disabled={running}
          className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md transition-colors"
        >
          {running ? 'Running...' : 'Run Tests ▶'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!results && !running && (
          <div className="text-center py-8">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Click "Run Tests" or press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+Enter</kbd> to run
            </p>
          </div>
        )}

        {running && (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">Running tests...</p>
          </div>
        )}

        {results && !running && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`text-2xl font-bold ${
                  results.failed === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {results.failed === 0 ? 'All Passed!' : `${results.failed} Failed`}
              </div>
              <div className="text-sm text-gray-500">
                {results.passed}/{results.total} passing
              </div>
            </div>

            {results.cases.map((tc, i) => (
              <div
                key={i}
                className={`border rounded-lg p-3 ${
                  tc.status === 'passed'
                    ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={tc.status === 'passed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                    {tc.status === 'passed' ? '✓' : '✗'}
                  </span>
                  <span className="text-sm text-gray-800 dark:text-gray-200">{tc.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-600 ml-auto">{tc.duration}ms</span>
                </div>
                {tc.error && (
                  <pre className="mt-2 text-xs text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/40 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                    {tc.error}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
