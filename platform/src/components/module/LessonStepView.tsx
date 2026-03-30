import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LessonStep, Module } from '@/types/exercise';
import { loadGuideContent } from '@/data/loader';
import { extractSections, findSection } from '@/sandbox/section-extractor';
import { MarkdownRenderer } from '@/components/lesson/MarkdownRenderer';
import { useProgressStore } from '@/store/progress-store';

interface LessonStepViewProps {
  module: Module;
  step: LessonStep;
  stepIndex: number;
  totalSteps: number;
}

export function LessonStepView({ module, step, stepIndex, totalSteps }: LessonStepViewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markLessonComplete = useProgressStore((s) => s.markLessonComplete);
  const isComplete = useProgressStore((s) => s.isLessonComplete(module.id, step.id));

  useEffect(() => {
    if (!module.guideFile) {
      setError('No guide file for this module');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    loadGuideContent(module.guideFile)
      .then((md) => {
        const sections = extractSections(md);
        const section = findSection(sections, step.sectionHeading);
        if (section) {
          setContent(section.content);
        } else {
          setError(`Section "${step.sectionHeading}" not found in guide`);
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [module.guideFile, step.sectionHeading]);

  const handleContinue = () => {
    markLessonComplete(module.id, step.id);
  };

  const hasNext = stepIndex < totalSteps - 1;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
          <div className="h-32 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <span className="bg-gray-800 px-2 py-1 rounded">📖 Lesson</span>
        <span>Step {stepIndex + 1} of {totalSteps}</span>
      </div>

      {/* Lesson content */}
      {content && <MarkdownRenderer content={content} />}

      {/* Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
        <Link
          to={`/module/${module.id}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to module
        </Link>

        {hasNext && (
          <Link
            to={`/module/${module.id}/step/${stepIndex + 1}`}
            onClick={handleContinue}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isComplete ? 'Next Step →' : 'Continue →'}
          </Link>
        )}

        {!hasNext && (
          <Link
            to={`/module/${module.id}`}
            onClick={handleContinue}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Complete Module ✓
          </Link>
        )}
      </div>
    </div>
  );
}
