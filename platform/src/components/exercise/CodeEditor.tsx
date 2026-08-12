import Editor, { type BeforeMount } from '@monaco-editor/react';
// Side-effect import: points @monaco-editor/react at the locally bundled
// Monaco instead of cdn.jsdelivr.net. Must run before the first <Editor/>.
import '@/monaco-setup';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/ui-store';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunTests?: () => void;
}

// Synthetic package.json entries so Monaco's module resolver maps
// `import x from 'react'` to the .d.ts files we fetch below.
const REACT_PACKAGE_JSON = JSON.stringify({
  name: 'react',
  version: '18.0.0',
  types: 'index.d.ts',
});

const REACT_DOM_PACKAGE_JSON = JSON.stringify({
  name: 'react-dom',
  version: '18.0.0',
  types: 'index.d.ts',
});

/**
 * Fetch the real React + ReactDOM type declarations from node_modules via the
 * /raw/ middleware. These are the same .d.ts files VSCode ships, so once they're
 * loaded into Monaco, the editor offers IDE-quality completions for every JSX
 * intrinsic element, every HTML attribute, every React hook, and every DOM event.
 *
 * Cached in module scope so the network round-trips only happen once per page load.
 */
const TYPE_FILES = [
  { path: 'platform/node_modules/@types/react/index.d.ts',           target: 'file:///node_modules/@types/react/index.d.ts' },
  { path: 'platform/node_modules/@types/react/global.d.ts',          target: 'file:///node_modules/@types/react/global.d.ts' },
  { path: 'platform/node_modules/@types/react/jsx-runtime.d.ts',     target: 'file:///node_modules/@types/react/jsx-runtime.d.ts' },
  { path: 'platform/node_modules/@types/react-dom/index.d.ts',       target: 'file:///node_modules/@types/react-dom/index.d.ts' },
  { path: 'platform/node_modules/@types/react-dom/client.d.ts',      target: 'file:///node_modules/@types/react-dom/client.d.ts' },
] as const;

let typesPromise: Promise<{ target: string; content: string }[]> | null = null;

function loadReactTypes() {
  if (!typesPromise) {
    typesPromise = Promise.all(
      TYPE_FILES.map(async ({ path, target }) => {
        const res = await fetch(`/raw/${path}`);
        if (!res.ok) throw new Error(`failed to load types: ${path}`);
        return { target, content: await res.text() };
      })
    );
  }
  return typesPromise;
}

export function CodeEditor({ value, onChange, onRunTests }: CodeEditorProps) {
  const { t } = useTranslation();
  const theme = useUIStore((s) => s.theme);
  const monacoConfigured = useRef(false);

  const handleBeforeMount: BeforeMount = (monaco) => {
    if (monacoConfigured.current) return;
    monacoConfigured.current = true;

    // Configure TypeScript to support JSX
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      jsxFragmentFactory: 'React.Fragment',
      allowNonTsExtensions: true,
      allowJs: true,
      esModuleInterop: true,
      noEmit: true,
      strict: false,
      skipLibCheck: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      types: ['react'],
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      // With the real @types/react now loaded, most of the previous suppressions
      // become unnecessary. Keep only the diagnostics that are genuinely noisy
      // in a learner-facing exercise context.
      diagnosticCodesToIgnore: [
        2307, // Cannot find module (other modules we don't ship types for)
        7016, // Could not find declaration file
        7006, // Parameter implicitly has an 'any' type
        7044, // Parameter implicitly has an 'any' type (in arrow fn)
        6133, // Variable is declared but never used (annoying while typing)
      ],
    });

    const addLib = (content: string, path: string) =>
      monaco.languages.typescript.typescriptDefaults.addExtraLib(content, path);

    // Plant the package.json shims synchronously so Monaco's resolver finds
    // `react` and `react-dom` even before the .d.ts files arrive.
    addLib(REACT_PACKAGE_JSON, 'file:///node_modules/react/package.json');
    addLib(REACT_DOM_PACKAGE_JSON, 'file:///node_modules/react-dom/package.json');

    // Then load the real .d.ts files asynchronously and register them.
    // Monaco will re-validate open models once the libs are added.
    loadReactTypes()
      .then((files) => {
        for (const { content, target } of files) addLib(content, target);
      })
      .catch((e) => {
        console.warn('[CodeEditor] could not load React types for autocomplete:', e);
      });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs text-gray-500 font-mono">{t('exercise.fileName')}</span>
        <span className="text-xs text-gray-400 dark:text-gray-600">
          {t('exercise.ctrlEnter')}
        </span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language="typescript"
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          path="file:///index.tsx"
          value={value}
          onChange={(v) => onChange(v ?? '')}
          beforeMount={handleBeforeMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12 },
          }}
          onMount={(editor, monaco) => {
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              () => onRunTests?.()
            );
          }}
        />
      </div>
    </div>
  );
}
