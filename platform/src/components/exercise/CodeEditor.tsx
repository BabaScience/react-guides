import Editor, { type BeforeMount } from '@monaco-editor/react';
import { useRef } from 'react';
import { useUIStore } from '@/store/ui-store';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunTests?: () => void;
}

const REACT_TYPES = `
declare module 'react' {
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useContext<T>(context: React.Context<T>): T;
  export function useRef<T>(initial: T): { current: T };
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initial: S): [S, (action: A) => void];
  export function createContext<T>(defaultValue: T): React.Context<T>;
  export function memo<T extends React.FC<any>>(component: T): T;
  export const Fragment: symbol;
  export type ReactNode = string | number | boolean | null | undefined | JSX.Element | ReactNode[];
  export type FC<P = {}> = (props: P) => JSX.Element | null;
  export type Context<T> = { Provider: FC<{ value: T; children?: ReactNode }>; Consumer: FC<{ children: (value: T) => ReactNode }> };
  export default React;
  namespace React {
    type ReactNode = string | number | boolean | null | undefined | JSX.Element | ReactNode[];
    type FC<P = {}> = (props: P) => JSX.Element | null;
    type Context<T> = { Provider: FC<{ value: T; children?: ReactNode }>; Consumer: FC<{ children: (value: T) => ReactNode }> };
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element {}
  }
}
`;

export function CodeEditor({ value, onChange, onRunTests }: CodeEditorProps) {
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
    });

    // Suppress semantic diagnostics for simpler experience
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      // Suppress specific error codes that are noisy in sandbox context
      diagnosticCodesToIgnore: [
        2307, // Cannot find module
        2304, // Cannot find name
        7016, // Could not find declaration file
        1259, // Module can only be default-imported using esModuleInterop
        2686, // 'React' refers to a UMD global
        2792, // Cannot find module
        1005, // ';' expected (sometimes false positive in JSX)
        7044, // Parameter implicitly has an 'any' type
        7006, // Parameter implicitly has an 'any' type
        2708, // Cannot use namespace 'React' as a value
        2503, // Cannot find namespace
        2339, // Property does not exist on type
      ],
    });

    // Add React type declarations
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      REACT_TYPES,
      'file:///node_modules/@types/react/index.d.ts'
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs text-gray-500 font-mono">index.tsx</span>
        <span className="text-xs text-gray-400 dark:text-gray-600">
          Ctrl+Enter to run tests
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
          onMount={(editor) => {
            editor.addCommand(
              // eslint-disable-next-line no-bitwise
              2048 | 3, // CtrlCmd + Enter
              () => onRunTests?.()
            );
          }}
        />
      </div>
    </div>
  );
}
