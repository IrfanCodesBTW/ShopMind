// ============================================================================
// Badge Primitive — Frosted Glass Indicator Badge
// Source: Design.md, design-taste-frontend
// ============================================================================

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'primary',
  icon,
  className = '',
  ...props
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-500/10 text-blue-300 border-blue-400/20',
    success: 'bg-green-500/10 text-green-300 border-green-400/20',
    warning: 'bg-yellow-500/10 text-yellow-300 border-yellow-400/20',
    danger: 'bg-red-500/10 text-red-300 border-red-400/20',
    info: 'bg-blue-500/10 text-blue-300 border-blue-400/20',
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md select-none',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
