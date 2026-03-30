import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Module } from '@/types/exercise';
import { loadExerciseStub, loadTestFile } from '@/data/loader';
import { useProgressStore } from '@/store/progress-store';
import { SplitPane } from '@/components/exercise/SplitPane';
import { CodeEditor } from '@/components/exercise/CodeEditor';
import { ExercisePanel } from '@/components/exercise/ExercisePanel';
import { TestResultsPanel } from '@/components/exercise/TestResultsPanel';
import { runTestsInSandbox } from '@/sandbox/sandbox-iframe';
import { buildExerciseCode, reassembleFullCode } from '@/sandbox/exercise-extractor';
import type { TestRunResult } from '@/types/exercise';

interface ExerciseStepViewProps {
  module: Module;
  exerciseId: string;
  stepIndex: number;
  totalSteps: number;
}

function stripImports(code: string): string {
  const lines = code.split('\n');
  const result: string[] = [];
  let skipNext = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('import ')) {
      if (!trimmed.includes(';') && !trimmed.includes("'") && !trimmed.endsWith("';") && !trimmed.endsWith('";')) {
        skipNext = true;
      }
      continue;
    }
    if (skipNext) {
      if (trimmed.includes(';') || trimmed.includes("from '") || trimmed.includes('from "')) {
        skipNext = false;
      }
      continue;
    }
    result.push(line);
  }
  while (result.length > 0 && result[0].trim() === '') result.shift();
  return result.join('\n');
}

export function ExerciseStepView({ module, exerciseId, stepIndex, totalSteps }: ExerciseStepViewProps) {
  const exercise = module.exercises.find((e) => e.id === exerciseId);
  const progress = useProgressStore((s) => s.getExerciseProgress(module.id, exerciseId));
  const saveCode = useProgressStore((s) => s.saveCode);
  const saveTestResults = useProgressStore((s) => s.saveTestResults);

  const [code, setCode] = useState('');
  const [defaultCode, setDefaultCode] = useState('');
  const [fullFile, setFullFile] = useState('');
  const [testFileContent, setTestFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<TestRunResult | null>(progress?.testResults ?? null);
  const [running, setRunning] = useState(false);

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

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      saveCode(module.id, exerciseId, newCode);
    },
    [module.id, exerciseId, saveCode]
  );

  const handleRunTests = useCallback(async () => {
    if (!exercise || running) return;
    setRunning(true);
    try {
      const userBody = stripImports(code);
      const fullCode = reassembleFullCode(fullFile, exercise.number, userBody);
      const result = await runTestsInSandbox(fullCode, testFileContent, exercise.number);
      setResults(result);
      saveTestResults(module.id, exerciseId, result);
    } catch (e) {
      setResults({
        timestamp: Date.now(),
        passed: 0, failed: 1, total: 1,
        cases: [{ name: 'Sandbox Error', status: 'failed', error: String(e), duration: 0 }],
      });
    } finally {
      setRunning(false);
    }
  }, [code, fullFile, testFileContent, exercise, module.id, exerciseId, running, saveTestResults]);

  const handleReset = useCallback(() => {
    setCode(defaultCode);
    saveCode(module.id, exerciseId, defaultCode);
  }, [defaultCode, module.id, exerciseId, saveCode]);

  if (!exercise) return <div className="p-8 text-red-400">Exercise not found</div>;

  const allPassed = results && results.failed === 0 && results.total > 0;
  const hasNext = stepIndex < totalSteps - 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">Loading exercise...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Exercise top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded">
            Exercise {exercise.number}
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{exercise.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 rounded transition-colors"
          >
            Reset
          </button>
          {allPassed && hasNext && (
            <Link
              to={`/module/${module.id}/step/${stepIndex + 1}`}
              className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
            >
              Next Step →
            </Link>
          )}
        </div>
      </div>

      {/* Editor + Results */}
      <div className="flex-1 min-h-0">
        <SplitPane
          left={
            <CodeEditor value={code} onChange={handleCodeChange} onRunTests={handleRunTests} />
          }
          right={
            <div className="h-full flex flex-col">
              <div className="h-2/5 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
                <ExercisePanel exercise={exercise} moduleName={module.name} />
              </div>
              <div className="flex-1 min-h-0">
                <TestResultsPanel results={results} running={running} onRun={handleRunTests} />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
