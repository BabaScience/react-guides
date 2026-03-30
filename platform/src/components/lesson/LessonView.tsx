import { useParams, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getModule } from '@/data/modules';
import { loadGuideContent } from '@/data/loader';
import { MarkdownRenderer } from './MarkdownRenderer';

export function LessonView() {
  const { id } = useParams<{ id: string }>();
  const mod = id ? getModule(id) : undefined;
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mod?.guideFile) return;
    setLoading(true);
    loadGuideContent(mod.guideFile)
      .then(setContent)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [mod?.guideFile]);

  if (!mod) return <Navigate to="/" replace />;

  return (
    <div className="px-6 py-8">
      {loading && (
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-800 rounded w-2/3" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
            <div className="h-32 bg-gray-800 rounded" />
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-red-400 mb-4">Failed to load lesson content</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      )}

      {content && (
        <>
          <MarkdownRenderer content={content} />
          <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-gray-800 flex justify-between">
            <Link
              to={`/module/${mod.id}`}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to module
            </Link>
            {mod.exercises.length > 0 && (
              <Link
                to={`/module/${mod.id}/exercise/${mod.exercises[0].id}`}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
              >
                Start Exercises →
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
