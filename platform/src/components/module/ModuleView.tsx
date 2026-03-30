import { useParams, Link, Navigate } from 'react-router-dom';
import { getModule } from '@/data/modules';
import { useProgressStore } from '@/store/progress-store';
import { ExerciseChecklist } from '@/components/progress/ExerciseChecklist';

export function ModuleView() {
  const { id } = useParams<{ id: string }>();
  const mod = id ? getModule(id) : undefined;
  const isUnlocked = useProgressStore((s) => id ? s.isModuleUnlocked(id) : false);
  const { passed, total } = useProgressStore((s) => id ? s.getModuleProgress(id) : { passed: 0, total: 0 });

  if (!mod) return <Navigate to="/" replace />;
  if (!isUnlocked) return <Navigate to="/" replace />;

  const progressPct = total > 0 ? (passed / total) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="font-mono">{String(mod.number).padStart(2, '0')}</span>
          <span>/</span>
          <span>12 Modules</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{mod.name}</h1>
        <p className="text-gray-400">{mod.description}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-300">
              {passed}/{total} exercises
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        {mod.guideFile && (
          <Link
            to={`/module/${mod.id}/lesson`}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors flex-shrink-0"
          >
            Read Lesson
          </Link>
        )}
      </div>

      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-900/50 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300">Exercises</h2>
        </div>
        <ExerciseChecklist module={mod} />
      </div>
    </div>
  );
}
