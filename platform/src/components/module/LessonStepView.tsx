import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import type { LessonStep, Module } from '@/types/exercise';
import { loadGuide } from '@/data/loader';
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
  const { t } = useTranslation();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markLessonComplete = useProgressStore((s) => s.markLessonComplete);
  const isComplete = useProgressStore((s) => s.isLessonComplete(module.id, step.id));

  useEffect(() => {
    if (!module.guideFile) {
      setError(t('errors.noGuideFile'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    loadGuide(module.guideFile)
      .then(({ localized, english }) => {
        const section = findSection(
          extractSections(english),
          extractSections(localized),
          step.sectionHeading
        );
        if (section) {
          setContent(section.content);
        } else {
          setError(t('errors.sectionNotFound', { section: step.sectionHeading }));
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.guideFile, step.sectionHeading, i18n.language]);

  // A lesson counts as read once its content is on screen. Previously this only
  // fired from the "Continue" button, so anyone navigating by the step timeline
  // or the top-bar Next link finished a module with 0% recorded.
  useEffect(() => {
    if (content && !isComplete) markLessonComplete(module.id, step.id);
  }, [content, isComplete, markLessonComplete, module.id, step.id]);

  const hasNext = stepIndex < totalSteps - 1;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <span className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">📖 {t('step.lesson')}</span>
        <span>{t('step.stepOf', { current: stepIndex + 1, total: totalSteps })}</span>
      </div>

      {/* Lesson content */}
      {content && <MarkdownRenderer content={content} />}

      {/* Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <Link
          to={`/module/${module.id}`}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {t('nav.backToModule')}
        </Link>

        {hasNext && (
          <Link
            to={`/module/${module.id}/step/${stepIndex + 1}`}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white dark:bg-gray-100 dark:hover:bg-gray-300 dark:text-gray-900 text-sm font-medium rounded-full transition-colors"
          >
            {isComplete ? t('nav.nextStep') : t('nav.continue')}
          </Link>
        )}

        {!hasNext && (
          <Link
            to={`/module/${module.id}`}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full transition-colors"
          >
            {t('nav.completeModule')}
          </Link>
        )}
      </div>
    </div>
  );
}
