import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import type { LocalizedText, Module, QuizQuestion } from '@/types/exercise';
import { useProgressStore } from '@/store/progress-store';
import { InlineMarkdown, MarkdownRenderer } from '@/components/lesson/MarkdownRenderer';
import { Button } from '@/components/ui';

interface QuizStepViewProps {
  module: Module;
  stepId: string;
  stepIndex: number;
  totalSteps: number;
}

/** Quiz text carries its own locales; `en` is guaranteed by the compiler. */
function localized(text: LocalizedText): string {
  return text[i18n.language] ?? text.en;
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/**
 * A checkpoint: answer, see immediately whether you were right, and read why.
 *
 * The explanation is the point. A score alone tells a learner they were wrong
 * without telling them what to think instead, so answers stay visible and every
 * question shows its reasoning once revealed — including for correct answers,
 * where the usual failure is being right for the wrong reason.
 *
 * Nothing is gated on the score. This marks the step complete either way; it is
 * a self-check, not an exam.
 */
export function QuizStepView({ module, stepId, stepIndex, totalSteps }: QuizStepViewProps) {
  const { t } = useTranslation();
  const saved = useProgressStore((s) => s.getQuizResult(module.id, stepId));
  const saveQuizResult = useProgressStore((s) => s.saveQuizResult);
  const resetQuiz = useProgressStore((s) => s.resetQuiz);

  const questions = useMemo(() => module.quiz?.questions ?? [], [module.quiz]);

  const [answers, setAnswers] = useState<Record<string, string[]>>(saved?.answers ?? {});
  const [revealed, setRevealed] = useState(saved !== null);

  const answeredCount = questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;

  const score = useMemo(() => {
    const correctIds = (q: QuizQuestion) => q.options.filter((o) => o.correct).map((o) => o.id);
    return questions.filter((q) => sameSet(answers[q.id] ?? [], correctIds(q))).length;
  }, [questions, answers]);

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center text-gray-500">
        {t('quiz.empty')}
      </div>
    );
  }

  const toggle = (question: QuizQuestion, optionId: string) => {
    if (revealed) return;
    setAnswers((prev) => {
      const current = prev[question.id] ?? [];
      if (!question.multiple) return { ...prev, [question.id]: [optionId] };
      return {
        ...prev,
        [question.id]: current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      };
    });
  };

  const handleCheck = () => {
    setRevealed(true);
    saveQuizResult(module.id, stepId, { answers, correct: score, total: questions.length });
  };

  const handleRetry = () => {
    resetQuiz(module.id, stepId);
    setAnswers({});
    setRevealed(false);
  };

  const hasNext = stepIndex < totalSteps - 1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <span className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
          <span aria-hidden="true">✓</span> {t('quiz.checkpoint')}
        </span>
        <span>{t('step.stepOf', { current: stepIndex + 1, total: totalSteps })}</span>
      </div>

      <h1 className="font-display text-2xl text-gray-900 dark:text-white mb-2">
        {t('quiz.title')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {t('quiz.intro', { count: questions.length })}
      </p>

      <ol className="space-y-8">
        {questions.map((question, index) => {
          const selected = answers[question.id] ?? [];
          const correctIds = question.options.filter((o) => o.correct).map((o) => o.id);
          const isCorrect = sameSet(selected, correctIds);

          return (
            <li key={question.id}>
              <fieldset>
                <legend className="text-base text-gray-900 dark:text-gray-100 mb-1">
                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500 mr-2">
                    {index + 1}
                  </span>
                  <InlineMarkdown content={localized(question.prompt)} />
                </legend>
                {question.multiple && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 ml-6">
                    {t('quiz.selectAll')}
                  </p>
                )}

                <div className="space-y-1.5 ml-6">
                  {question.options.map((option) => {
                    const chosen = selected.includes(option.id);
                    // After revealing, every correct option is marked — not only
                    // the one picked — so a near-miss shows what was missed.
                    const tone = !revealed
                      ? chosen
                        ? 'border-primary-400 dark:border-primary-500/60 bg-primary-50 dark:bg-primary-600/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      : option.correct
                        ? 'border-emerald-300 dark:border-emerald-600/50 bg-emerald-50 dark:bg-emerald-950/20'
                        : chosen
                          ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                          : 'border-gray-200 dark:border-gray-800 opacity-70';

                    return (
                      <label
                        key={option.id}
                        className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border transition-colors ${tone} ${
                          revealed ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <input
                          type={question.multiple ? 'checkbox' : 'radio'}
                          name={question.id}
                          value={option.id}
                          checked={chosen}
                          disabled={revealed}
                          onChange={() => toggle(question, option.id)}
                          className="mt-0.5 accent-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          <InlineMarkdown content={localized(option.text)} />
                        </span>
                        {revealed && option.correct && (
                          <span className="ml-auto text-xs text-emerald-700 dark:text-emerald-400 shrink-0">
                            {t('quiz.correctLabel')}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {revealed && question.explanation && (
                <div
                  className={`ml-6 mt-2 px-3 py-2 rounded-lg border text-sm ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20'
                  }`}
                >
                  <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                    {isCorrect ? t('quiz.right') : t('quiz.notQuite')}
                  </p>
                  <div className="[&_p]:mb-0 [&_p]:text-sm">
                    <MarkdownRenderer content={localized(question.explanation)} />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
        {!revealed ? (
          <>
            <p role="status" className="text-sm text-gray-500 dark:text-gray-400">
              {t('quiz.answered', { answered: answeredCount, total: questions.length })}
            </p>
            <Button variant="primary" size="lg" onClick={handleCheck} disabled={!allAnswered}>
              {t('quiz.check')}
            </Button>
          </>
        ) : (
          <>
            <p role="status" className="text-sm text-gray-700 dark:text-gray-300">
              {t('quiz.score', { correct: score, total: questions.length })}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="lg" onClick={handleRetry}>
                {t('quiz.retry')}
              </Button>
              {hasNext && (
                <Link
                  to={`/module/${module.id}/step/${stepIndex + 1}`}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-700 text-white dark:bg-gray-100 dark:hover:bg-gray-300 dark:text-gray-900 text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950"
                >
                  {t('nav.nextStep')}
                </Link>
              )}
              {!hasNext && (
                <Link
                  to={`/module/${module.id}`}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950"
                >
                  {t('nav.completeModule')}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
