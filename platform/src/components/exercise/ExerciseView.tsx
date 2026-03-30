import { useParams, Navigate, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { getModule } from '@/data/modules';
import { loadExerciseStub, loadTestFile } from '@/data/loader';
import { useProgressStore } from '@/store/progress-store';
import { SplitPane } from './SplitPane';
import { CodeEditor } from './CodeEditor';
import { ExercisePanel } from './ExercisePanel';
import { TestResultsPanel } from './TestResultsPanel';
import { runTestsInSandbox } from '@/sandbox/sandbox-iframe';
import { buildExerciseCode, reassembleFullCode } from '@/sandbox/exercise-extractor';
import type { TestRunResult } from '@/types/exercise';

export function ExerciseView() {
  const { id: moduleId, exId } = useParams<{ id: string; exId: string }>();
  const mod = moduleId ? getModule(moduleId) : undefined;
  const exercise = mod?.exercises.find((e) => e.id === exId);

  const progress = useProgressStore((s) =>
    moduleId && exId ? s.getExerciseProgress(moduleId, exId) : null
  );
  const status = useProgressStore((s) =>
    moduleId && exId ? s.getExerciseStatus(moduleId, exId) : 'locked'
  );
  const saveCode = useProgressStore((s) => s.saveCode);
  const saveTestResults = useProgressStore((s) => s.saveTestResults);

  // The code the user edits (single exercise only)
  const [code, setCode] = useState('');
  // The default single-exercise code (for reset)
  const [defaultCode, setDefaultCode] = useState('');
  // The original full file (all exercises) — needed to reassemble for tests
  const fullFileRef = useRef('');
  const [testFileContent, setTestFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<TestRunResult | null>(progress?.testResults ?? null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!mod || !exercise) return;
    setLoading(true);
    setResults(progress?.testResults ?? null);

    Promise.all([loadExerciseStub(mod.exerciseDir), loadTestFile(mod.exerciseDir)])
      .then(([fullStub, tests]) => {
        fullFileRef.current = fullStub;
        setTestFileContent(tests);

        // Extract only this exercise's code
        const exerciseCode = buildExerciseCode(fullStub, exercise.number);
        setDefaultCode(exerciseCode);

        // Use saved code if available, otherwise use extracted stub
        setCode(progress?.userCode || exerciseCode);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod?.exerciseDir, exercise?.number]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      if (moduleId && exId) {
        saveCode(moduleId, exId, newCode);
      }
    },
    [moduleId, exId, saveCode]
  );

  const handleRunTests = useCallback(async () => {
    if (!exercise || !moduleId || !exId || running) return;
    setRunning(true);
    try {
      // Strip the import header from user code before reassembling,
      // since reassembleFullCode adds imports from the original file.
      const userBodyCode = stripImports(code);

      // Reassemble the full file with the user's exercise code patched in
      const fullCode = reassembleFullCode(
        fullFileRef.current,
        exercise.number,
        userBodyCode
      );

      const result = await runTestsInSandbox(
        fullCode,
        testFileContent,
        exercise.number
      );
      setResults(result);
      saveTestResults(moduleId, exId, result);
    } catch (e) {
      setResults({
        timestamp: Date.now(),
        passed: 0,
        failed: 1,
        total: 1,
        cases: [
          {
            name: 'Sandbox Error',
            status: 'failed',
            error: String(e),
            duration: 0,
          },
        ],
      });
    } finally {
      setRunning(false);
    }
  }, [code, testFileContent, exercise, moduleId, exId, running, saveTestResults]);

  const handleReset = useCallback(() => {
    setCode(defaultCode);
    if (moduleId && exId) {
      saveCode(moduleId, exId, defaultCode);
    }
  }, [defaultCode, moduleId, exId, saveCode]);

  if (!mod || !exercise) return <Navigate to="/" replace />;
  if (status === 'locked') return <Navigate to={`/module/${moduleId}`} replace />;

  // Find next exercise
  const nextExercise = mod.exercises.find((e) => e.number === exercise.number + 1);
  const allPassed = results && results.failed === 0 && results.total > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">Loading exercise...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link
            to={`/module/${moduleId}`}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            ← Back
          </Link>
          <span className="text-sm font-medium text-gray-200">
            Exercise {exercise.number}: {exercise.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2 py-1 text-xs text-gray-400 hover:text-white border border-gray-700 rounded transition-colors"
          >
            Reset Code
          </button>
          {allPassed && nextExercise && (
            <Link
              to={`/module/${moduleId}/exercise/${nextExercise.id}`}
              className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
            >
              Next Exercise →
            </Link>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0">
        <SplitPane
          left={
            <div className="h-full flex flex-col">
              <div className="flex border-b border-gray-800">
                <TabButton label="Code" active />
              </div>
              <div className="flex-1 min-h-0">
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  onRunTests={handleRunTests}
                />
              </div>
            </div>
          }
          right={
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="h-1/3 border-b border-gray-800 overflow-hidden">
                  <ExercisePanel exercise={exercise} moduleName={mod.name} />
                </div>
                <div className="flex-1 min-h-0">
                  <TestResultsPanel
                    results={results}
                    running={running}
                    onRun={handleRunTests}
                  />
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

/**
 * Strip import lines from user code so they don't duplicate
 * when reassembled with the original file's imports.
 */
function stripImports(code: string): string {
  const lines = code.split('\n');
  const result: string[] = [];
  let skipNext = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('import ')) {
      // Multi-line import: skip until we find the closing line
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

  // Trim leading blank lines
  while (result.length > 0 && result[0].trim() === '') {
    result.shift();
  }

  return result.join('\n');
}

function TabButton({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-4 py-2 text-xs font-medium transition-colors ${
        active
          ? 'text-white border-b-2 border-primary-500 bg-gray-900/50'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  );
}
