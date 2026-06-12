import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'accent' | 'success' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

// "Paper & ink" recipes from DESIGN_SYSTEM.md §7.1 — change there first, then here.
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gray-900 hover:bg-gray-700 text-white dark:bg-gray-100 dark:hover:bg-gray-300 dark:text-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
  accent:
    'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700',
  secondary:
    'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  ghost:
    'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-1.5 text-xs',
  lg: 'px-5 py-2 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'rounded-full font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    />
  );
}
