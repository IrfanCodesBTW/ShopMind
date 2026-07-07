// ============================================================================
// Skeleton Primitive — Glowing Glass Loading Skeleton
// Source: Design.md, design-taste-frontend
// ============================================================================

import React from 'react';

export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'animate-skeleton bg-white/5 border border-white/5 rounded-[12px] h-4 w-full',
        className,
      ].join(' ')}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel p-6 space-y-4">
      <Skeleton className="w-1/3 h-6" />
      <Skeleton className="w-2/3 h-4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-1/2 h-3" />
          <Skeleton className="w-1/4 h-3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5">
      <div className="flex items-center gap-3 w-1/3">
        <Skeleton className="w-10 h-10 rounded-[12px] flex-shrink-0" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-16 rounded-full" />
    </div>
  );
}
