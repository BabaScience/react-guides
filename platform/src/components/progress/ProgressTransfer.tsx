import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProgressStore } from '@/store/progress-store';

/**
 * Export / import saved progress as a JSON file.
 *
 * Progress lives only in this browser's localStorage — no account, no sync.
 * Clearing site data or moving to another machine loses every solved exercise
 * and every line of saved code. This is the escape hatch until there are
 * accounts, and it doubles as the way to carry work between machines.
 */
export function ProgressTransfer({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const exportProgress = useProgressStore((s) => s.exportProgress);
  const importProgress = useProgressStore((s) => s.importProgress);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const handleExport = () => {
    const data = exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-progress-${data.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ ok: true, message: t('progress.exported') });
  };

  const handleFile = async (file: File) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setStatus({ ok: false, message: t('progress.importNotRecognised') });
      return;
    }
    const result = importProgress(parsed);
    setStatus(
      result.ok
        ? {
            ok: true,
            message: t('progress.imported', {
              exercises: result.exercises,
              lessons: result.lessons,
            }),
          }
        : { ok: false, message: t(result.errorKey ?? 'progress.importNotRecognised') }
    );
  };

  const buttonClass =
    'flex-1 px-2 py-1 text-[10px] font-medium rounded-full border border-gray-200 dark:border-gray-800 ' +
    'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white ' +
    'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ' +
    'focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950';

  if (collapsed) return null;

  return (
    <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800">
      <div className="flex gap-1.5">
        <button type="button" onClick={handleExport} className={buttonClass}>
          {t('progress.export')}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={buttonClass}
        >
          {t('progress.import')}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label={t('progress.import')}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          // Reset so choosing the same file twice still fires a change event.
          e.target.value = '';
        }}
      />
      {status && (
        <p
          role="status"
          className={`mt-1.5 text-[10px] ${
            status.ok
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-700 dark:text-red-400'
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
