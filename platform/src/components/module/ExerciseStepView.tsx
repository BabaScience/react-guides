import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Module } from '@/types/exercise';
import { loadExerciseStub, loadTestFile, loadExerciseSolution } from '@/data/loader';
import { useProgressStore } from '@/store/progress-store';
import { SplitPane } from '@/components/exercise/SplitPane';
import { CodeEditorLazy as CodeEditor } from '@/components/exercise/CodeEditorLazy';
import { ExercisePanel } from '@/components/exercise/ExercisePanel';
import { TestResultsPanel } from '@/components/exercise/TestResultsPanel';
import { LivePreview } from '@/components/exercise/LivePreview';
import { MarkdownRenderer } from '@/components/lesson/MarkdownRenderer';
import { Button } from '@/components/ui';
import { DEFAULT_TIMEOUT_MS, getRunner } from '@/sandbox/runners';
import { buildExerciseCode } from '@/sandbox/exercise-extractor';
import type { TestRunResult } from '@/types/exercise';

interface ExerciseStepViewProps {
  module: Module;
  exerciseId: string;
  stepIndex: number;
  totalSteps: number;
}

/** How long the editor stays quiet before the draft is written to storage. */
const SAVE_DEBOUNCE_MS = 600;

function TabButton({
  label,
  active,
  disabled,
  title,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={!!active}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={`px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${
        disabled
          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          : active
            ? 'text-gray-900 dark:text-white border-b-2 border-primary-500 bg-white dark:bg-gray-950'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

export function ExerciseStepView({ module, exerciseId, stepIndex, totalSteps }: ExerciseStepViewProps) {
  const { t } = useTranslation();
  const exercise = module.exercises.find((e) => e.id === exerciseId);
  const progress = useProgressStore((s) => s.getExerciseProgress(module.id, exerciseId));
  const saveCode = useProgressStore((s) => s.saveCode);
  const saveTestResults = useProgressStore((s) => s.saveTestResults);
  const markExerciseComplete = useProgressStore((s) => s.markExerciseComplete);

  /**
   * Gate for the reference solution. `completedManually` also promotes status
   * to 'passed', so the escape hatch opens this too — deliberately: it exists
   * for people the runner has failed, and the gate is a nudge to try first,
   * not a lock. Anyone determined can read the repo.
   */
  const hasPassed = progress?.status === 'passed';

  const [code, setCode] = useState('');
  const [defaultCode, setDefaultCode] = useState('');
  const [fullFile, setFullFile] = useState('');
  const [testFileContent, setTestFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<TestRunResult | null>(progress?.testResults ?? null);
  const [running, setRunning] = useState(false);
  const [leftTab, setLeftTab] = useState<'code' | 'preview' | 'solution'>('code');
  const [solution, setSolution] = useState('');

  useEffect(() => {
    if (!exercise) return;
    setLoading(true);
    setResults(progress?.testResults ?? null);

    Promise.all([loadExerciseStub(module.exerciseDir), loadTestFile(module.exerciseDir)])
      .then(([stub, tests]) => {
        setFullFile(stub);
        setTestFileContent(tests);
        const exerciseCode = buildExerciseCode(stub, exercise.number);
        setDefaultCode(exerciseCode);
        setCode(progress?.userCode || exerciseCode);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.exerciseDir, exercise?.number]);

  // Fetched only for modules the manifest says have solutions, and only once
  // the learner has passed — so the answer is not sitting in the network tab
  // of someone who is still working on it.
  useEffect(() => {
    if (!exercise || !module.hasSolutions || !hasPassed) return;
    let cancelled = false;
    loadExerciseSolution(module.exerciseDir)
      .then((file) => {
        if (!cancelled) setSolution(buildExerciseCode(file, exercise.number));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.exerciseDir, module.hasSolutions, exercise?.number, hasPassed]);

  // Leaving a passed exercise for an unsolved one must not carry the previous
  // answer into the new tab.
  useEffect(() => {
    setSolution('');
    setLeftTab('code');
  }, [exerciseId]);

  // Persisting on every keystroke meant a JSON.stringify of the whole progress
  // store plus a localStorage write per character. Keep the editor state
  // immediate and debounce only the persistence.
  const saveTimerRef = useRef<number | null>(null);
  const pendingSaveRef = useRef<(() => void) | null>(null);

  const flushPendingSave = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    pendingSaveRef.current?.();
    pendingSaveRef.current = null;
  }, []);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      pendingSaveRef.current = () => saveCode(module.id, exerciseId, newCode);
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(flushPendingSave, SAVE_DEBOUNCE_MS);
    },
    [module.id, exerciseId, saveCode, flushPendingSave]
  );

  // Never lose work: flush on unmount (navigating away) and on tab close.
  useEffect(() => {
    const onHide = () => flushPendingSave();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      flushPendingSave();
    };
  }, [flushPendingSave]);

  const handleRunTests = useCallback(async () => {
    if (!exercise || running) return;
    setRunning(true);
    try {
      const result = await getRunner(module).run({
        userCode: code,
        moduleSource: fullFile,
        spec: testFileContent,
        exerciseNumber: exercise.number,
        timeoutMs: DEFAULT_TIMEOUT_MS,
      });
      setResults(result);
      saveTestResults(module.id, exerciseId, result);
    } catch (e) {
      setResults({
        timestamp: Date.now(),
        passed: 0, failed: 1, total: 1,
        cases: [{ name: t('exercise.sandboxError'), status: 'failed', error: String(e), duration: 0 }],
      });
    } finally {
      setRunning(false);
    }
  }, [code, fullFile, testFileContent, exercise, module, exerciseId, running, saveTestResults, t]);

  const handleReset = useCallback(() => {
    // Drop any queued save first, or the debounce would write the discarded
    // draft back over the freshly reset stub.
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    pendingSaveRef.current = null;
    setCode(defaultCode);
    saveCode(module.id, exerciseId, defaultCode);
  }, [defaultCode, module.id, exerciseId, saveCode]);

  if (!exercise) return <div className="p-8 text-red-400">{t('errors.exerciseNotFound')}</div>;

  const allPassed = results && results.failed === 0 && results.total > 0;
  const isManuallyComplete = progress?.completedManually === true;
  const canAdvance = Boolean(allPassed || isManuallyComplete);
  const hasNext = stepIndex < totalSteps - 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">{t('exercise.loadingExercise')}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Exercise top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-2.5 py-0.5 rounded-full font-medium">
            {t('exercise.title', { number: exercise.number })}
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{t(`exercises.${module.id}.${exercise.id}.name`)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            {t('exercise.reset')}
          </Button>
          {hasNext && (
            <Link
              to={`/module/${module.id}/step/${stepIndex + 1}`}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors text-white ${
                canAdvance
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
              title={
                canAdvance
                  ? undefined
                  : t('nav.nextExerciseTooltipUnverified')
              }
            >
              {t('nav.nextStep')}
            </Link>
          )}
        </div>
      </div>

      {/* Editor + Results */}
      <div className="flex-1 min-h-0">
        <SplitPane
          left={
            <div className="h-full flex flex-col">
              <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <TabButton
                  label={t('exercise.code')}
                  active={leftTab === 'code'}
                  onClick={() => setLeftTab('code')}
                />
                <TabButton
                  label={t('exercise.preview')}
                  active={leftTab === 'preview'}
                  onClick={() => setLeftTab('preview')}
                />
                {module.hasSolutions && (
                  <TabButton
                    label={hasPassed ? t('exercise.solution') : `🔒 ${t('exercise.solution')}`}
                    active={leftTab === 'solution'}
                    disabled={!hasPassed}
                    title={hasPassed ? undefined : t('exercise.solutionLocked')}
                    onClick={() => setLeftTab('solution')}
                  />
                )}
              </div>
              <div className="flex-1 min-h-0">
                <div className={leftTab === 'code' ? 'h-full' : 'hidden'}>
                  <CodeEditor value={code} onChange={handleCodeChange} onRunTests={handleRunTests} />
                </div>
                {leftTab === 'preview' && (
                  <LivePreview
                    code={code}
                    componentName={exercise.componentName}
                    testSource={testFileContent}
                  />
                )}
                {leftTab === 'solution' && (
                  <div className="h-full overflow-auto p-4 bg-white dark:bg-gray-950">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {t('exercise.solutionNote')}
                    </p>
                    <MarkdownRenderer content={'```tsx\n' + solution + '\n```'} />
                  </div>
                )}
              </div>
            </div>
          }
          right={
            <div className="h-full flex flex-col">
              <div className="h-2/5 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
                <ExercisePanel exercise={exercise} moduleId={module.id} />
              </div>
              <div className="flex-1 min-h-0">
                <TestResultsPanel
                  results={results}
                  running={running}
                  onRun={handleRunTests}
                  completedManually={isManuallyComplete}
                  onMarkComplete={() => markExerciseComplete(module.id, exerciseId)}
                />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
