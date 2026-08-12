import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/ui-store';
import {
  DARK_THEME,
  LIGHT_THEME,
  getHighlighter,
  resolveLang,
} from './shiki-highlighter';

interface ShikiCodeProps {
  code: string;
  language?: string;
}

export function ShikiCode({ code, language }: ShikiCodeProps) {
  const { t } = useTranslation();
  const theme = useUIStore((s) => s.theme);
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  const lang = useMemo(() => resolveLang(language), [language]);

  useEffect(() => {
    // No grammar for this fence tag — the plain-code fallback below is correct.
    if (!lang) {
      setHtml(null);
      return;
    }
    let cancelled = false;
    getHighlighter().then((hl) => {
      if (cancelled) return;
      try {
        setHtml(
          hl.codeToHtml(code, {
            lang,
            theme: theme === 'dark' ? DARK_THEME : LIGHT_THEME,
          })
        );
      } catch (e) {
        // Grammar mismatch or runtime error — show plain code.
        setHtml(null);
        console.warn('[ShikiCode] highlight failed:', e);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang, theme]);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  return (
    <div className="relative group rounded-lg overflow-hidden my-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#24292e]">
      {/* IDE-style chrome */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-[#1b1f23] border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          <span className="ml-2 text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {language || t('common.code')}
          </span>
        </div>
        <button
          onClick={onCopy}
          className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded"
        >
          {copied ? '✓' : t('common.copy')}
        </button>
      </div>
      {html ? (
        // Shiki's HTML includes its own <pre><code> with inline styles
        <div
          className="text-sm shiki-container"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        // Pre-highlight fallback so users see the code immediately
        <pre className="overflow-x-auto p-4 text-sm font-mono text-gray-800 dark:text-gray-200">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
