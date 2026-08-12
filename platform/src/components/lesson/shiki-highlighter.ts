/**
 * A Shiki highlighter carrying only the grammars this project actually uses.
 *
 * Importing the `shiki` barrel registers all ~350 languages as lazy chunks.
 * They are never fetched at runtime, but Vite still emits every one of them:
 * 355 chunks and 8.5 MB of build output, including `emacs-lisp` (780 KB),
 * `cpp` (626 KB) and `wolfram` (262 KB) for a project that highlights TS, CSS
 * and shell. The allowlist in the old `ShikiCode` never took effect because
 * the barrel had already pulled the registry in.
 *
 * `createHighlighterCore` takes exactly what it is given. The JavaScript regex
 * engine also removes the 622 KB oniguruma WASM payload; it handles every
 * grammar below.
 */

import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import githubLight from '@shikijs/themes/github-light';
import githubDark from '@shikijs/themes/github-dark';

import bash from '@shikijs/langs/bash';
import css from '@shikijs/langs/css';
import diff from '@shikijs/langs/diff';
import html from '@shikijs/langs/html';
import json from '@shikijs/langs/json';
import markdown from '@shikijs/langs/markdown';
import tsx from '@shikijs/langs/tsx';
import typescript from '@shikijs/langs/typescript';
import yaml from '@shikijs/langs/yaml';

export const LIGHT_THEME = 'github-light';
export const DARK_THEME = 'github-dark';

/**
 * Fence tags accepted in chapters, mapped to a loaded grammar.
 * Anything else renders as plain text rather than pulling a new grammar in.
 */
const ALIASES: Record<string, string> = {
  ts: 'typescript',
  typescript: 'typescript',
  js: 'tsx',
  jsx: 'tsx',
  javascript: 'tsx',
  tsx: 'tsx',
  css: 'css',
  scss: 'css',
  html: 'html',
  xml: 'html',
  json: 'json',
  jsonc: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  md: 'markdown',
  markdown: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  diff: 'diff',
};

/** Grammar name for a fence tag, or `null` to render as plain text. */
export function resolveLang(tag?: string): string | null {
  if (!tag) return null;
  return ALIASES[tag.toLowerCase()] ?? null;
}

let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubLight, githubDark],
      langs: [typescript, tsx, css, html, json, bash, markdown, yaml, diff],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}
