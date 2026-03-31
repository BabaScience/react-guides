import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const { t } = useTranslation();
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  return (
    <div className="relative group rounded-lg overflow-hidden my-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 font-mono">{language || t('common.code')}</span>
        <button
          onClick={copyToClipboard}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {t('common.copy')}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className={language ? `language-${language}` : ''}>{code}</code>
      </pre>
    </div>
  );
}
