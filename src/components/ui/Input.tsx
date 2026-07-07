// ============================================================================
// Input — Core Primitive
// Source: new_Design_plan.md Task 4, Design.md §Inputs
// ============================================================================

'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Full-width wrapper — defaults to true */
  block?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      block = true,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={block ? 'w-full' : 'inline-flex flex-col'}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[var(--text-sm)] font-medium text-[var(--color-text-secondary)] mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-5 h-5 flex items-center justify-center pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={[
              'w-full h-12 px-4 text-[var(--text-body)] text-[var(--color-text-primary)]',
              'bg-[var(--color-surface)] border rounded-[var(--radius-md)]',
              'outline-none transition-all duration-[var(--motion-duration-fast)]',
              'placeholder:text-[var(--color-text-muted)]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-bg)]',
              error
                ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]/20'
                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
              leftIcon ? 'pl-11' : '',
              rightIcon ? 'pr-11' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-5 h-5 flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-[var(--text-sm)] text-[var(--color-danger)]"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-[var(--text-sm)] text-[var(--color-text-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
