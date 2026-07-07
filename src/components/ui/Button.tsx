// ============================================================================
// Button Primitive — Magnetic Pill Button
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useRef, useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)] border border-blue-400/20',
    secondary: 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 hover:text-white',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)] border border-red-400/20',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-semibold h-11',
    md: 'px-6 py-3 text-sm font-bold h-12',
    lg: 'px-8 py-4 text-base font-extrabold h-14',
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      disabled={loading || props.disabled}
      className={[
        'btn-press inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 select-none relative z-10 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        fullWidth ? 'w-full' : '',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      style={{
        ...style,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="opacity-80 transition-transform group-hover:scale-110">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
