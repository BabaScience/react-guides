import { useCallback } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  return (
    <div className="relative group rounded-lg overflow-hidden my-4 bg-gray-900 border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
        <span className="text-xs text-gray-500 font-mono">{language || 'code'}</span>
        <button
          onClick={copyToClipboard}
          className="text-xs text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className={language ? `language-${language}` : ''}>{code}</code>
      </pre>
    </div>
  );
}
