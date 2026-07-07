// ============================================================================
// Card Primitive — Liquid Glass Spotlight Card
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useRef, useState } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  padding = 'md',
  interactive = false,
  glow = true,
  className = '',
  style,
  ...props
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glow) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const padClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-10',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className={[
        'relative overflow-hidden rounded-[var(--radius-lg)] transition-all duration-500',
        interactive ? 'glass-panel-interactive cursor-pointer' : 'glass-panel',
        padClasses[padding],
        className,
      ].join(' ')}
      style={{
        ...style,
      }}
      {...props}
    >
      {/* Spotlight Border Glow */}
      {glow && isFocused && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.06), transparent 80%)`,
            opacity: isFocused ? 1 : 0,
          }}
        />
      )}

      {/* Internal Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
