// ============================================================================
// Card Primitive — Liquid Glass Spotlight Card (Decoupled Layer Architecture)
// Source: Design.md, design-taste-frontend, Layout System Spec V2.0
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
        'relative rounded-[var(--radius-lg)] transition-all duration-500 overflow-visible',
        interactive ? 'hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.35)]' : 'shadow-[0_15px_35px_rgba(0,0,0,0.25)]',
        className,
      ].join(' ')}
      style={style}
      {...props}
    >
      {/* Stacking Layer 2: Glass Panel (Blur, Background, and Border Isolation) */}
      <div
        className={[
          'w-full h-full rounded-[inherit] transition-all duration-500 overflow-hidden relative',
          interactive ? 'glass-panel-interactive' : 'glass-panel',
          padClasses[padding],
        ].join(' ')}
      >
        {/* Stacking Layer 3: Spotlight Highlight Layer */}
        {glow && isFocused && (
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.06), transparent 80%)`,
              opacity: isFocused ? 1 : 0,
              zIndex: 2,
            }}
          />
        )}

        {/* Stacking Layer 4: Content Layer */}
        <div className="relative z-10 w-full h-full">{children}</div>
      </div>
    </div>
  );
}
