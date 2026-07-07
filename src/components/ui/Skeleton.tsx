// ============================================================================
// Skeleton — Loading State Placeholder
// Source: new_Design_plan.md Task 4
// ============================================================================

import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
  lines?: number;
}

export function Skeleton({ width, height = '1rem', rounded = false, className = '' }: SkeletonProps) {
  return (
    <span
      className={[
        'animate-skeleton block',
        rounded ? 'rounded-[var(--radius-full)]' : 'rounded-[var(--radius-sm)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: width || '100%',
        height,
      }}
      aria-hidden="true"
    />
  );
}

/** Convenience preset — a card-shaped skeleton */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={[
        'rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 space-y-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Skeleton height="1.5rem" width="60%" />
      <Skeleton height="1rem" width="80%" />
      <Skeleton height="1rem" width="40%" />
    </div>
  );
}

/** Convenience preset — a transaction-row skeleton */
export function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div
      className={[
        'flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton height="1rem" width="50%" />
        <Skeleton height="0.75rem" width="30%" />
      </div>
      <Skeleton height="1.5rem" width="5rem" />
    </div>
  );
}
