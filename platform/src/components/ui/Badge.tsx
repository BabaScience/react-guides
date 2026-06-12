import type { ReactNode } from 'react';

export type BadgeTone =
  | 'neutral'
  | 'success'
  | 'info'
  | 'warning'
  | 'js'
  | 'react'
  | 'native';

// "Paper & ink" recipes from DESIGN_SYSTEM.md §7.2 + §2.4 — change there first, then here.
const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  info: 'bg-primary-100 dark:bg-primary-600/20 text-primary-700 dark:text-primary-400',
  warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  js: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  react: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  native: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
