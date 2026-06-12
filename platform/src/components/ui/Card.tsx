import type { HTMLAttributes } from 'react';

export type CardTone = 'default' | 'interactive' | 'success' | 'muted';

// Recipes from DESIGN_SYSTEM.md §7.3 — change there first, then here.
const toneClasses: Record<CardTone, string> = {
  default: 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50',
  interactive:
    'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary-300 dark:hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-gray-900/80',
  success:
    'border-emerald-300 dark:border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-500/50',
  muted:
    'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 opacity-70 hover:opacity-90',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
}

export function Card({ tone = 'default', className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border p-5 transition-all ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
