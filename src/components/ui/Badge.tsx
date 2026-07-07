// ============================================================================
// Badge — Semantic Variant Pill
// Source: new_Design_plan.md Task 4
// ============================================================================

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-[var(--color-primary-muted)] text-[var(--color-primary-hover)]',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  neutral: 'bg-[var(--color-divider)] text-[var(--color-text-secondary)]',
};

export function Badge({ variant = 'neutral', icon, children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-pill)]',
        'text-[var(--text-sm)] font-medium leading-none',
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <span className="w-3.5 h-3.5 flex items-center justify-center" aria-hidden>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
