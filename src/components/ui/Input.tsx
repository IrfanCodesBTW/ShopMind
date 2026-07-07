// ============================================================================
// Input Primitive — Premium Glass Input
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-slate-400 tracking-wide block uppercase">
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          className={[
            'w-full bg-white/5 border border-white/10 hover:border-white/15 focus:border-blue-500/50 focus:bg-white/[0.07] text-slate-200 focus:text-white rounded-[18px] h-12 px-4 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-slate-500 font-medium text-sm',
            leftIcon ? 'pl-11' : '',
            rightIcon ? 'pr-11' : '',
            error ? 'border-red-500/40 focus:border-red-500/50 focus:ring-red-500/10' : '',
            className,
          ].join(' ')}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-4 text-slate-400 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-400 mt-1 pl-1">
          {error}
        </p>
      )}
    </div>
  );
}
