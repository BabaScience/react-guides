import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  // `public/sandbox-host.js` is a build artifact (vite.sandbox.config.ts), not
  // source. Linting it reports errors from eslint-disable comments carried in
  // React's own bundled source, for rules this config doesn't define.
  { ignores: ['dist', 'public/raw', 'public/sandbox-host.js', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // The classic pair, deliberately *not* the full `recommended` preset:
      // eslint-plugin-react-hooks v7 folds in the React Compiler rules, which
      // flag every async "load into state" effect and the sandbox's `eval`.
      // Those are intentional here, and silencing them file-by-file would be
      // noisier than the signal. Revisit if the app adopts the compiler.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // The exercise sandbox has to evaluate learner code and reach into
      // untyped module namespaces; `any` there is deliberate and localised.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Empty catch blocks are used throughout the sandbox to keep cleanup
      // failures from masking a test result. They all carry a comment.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // The sandbox genuinely needs eval and loose typing to run learner code.
    files: ['src/sandbox/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}', 'scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  }
);
