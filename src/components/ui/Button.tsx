// ============================================================================
// Button — Core Primitive
// Source: new_Design_plan.md Task 4, Design.md §Buttons
// ============================================================================

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] cursor-pointer select-none btn-press focus-visible:outline-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-[var(--shadow-sm)]',
  secondary:
    'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-divider)] hover:text-[var(--color-text-primary)]',
  danger:
    'bg-[var(--color-danger)] hover:bg-red-700 text-white shadow-[var(--shadow-sm)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[var(--text-sm)]',
  md: 'h-12 px-5 text-[var(--text-body)]',
  lg: 'h-14 px-6 text-[var(--text-body-lg)]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={[
          base,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : icon ? (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center" aria-hidden>
            {icon}
          </span>
        ) : null}

        {children}

        {!loading && iconRight && (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center" aria-hidden>
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
