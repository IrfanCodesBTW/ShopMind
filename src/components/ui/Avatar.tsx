// ============================================================================
// Avatar — User/Customer Initials or Image
// Source: new_Design_plan.md Task 4
// ============================================================================

import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-[var(--text-sm)]',
  md: 'w-10 h-10 text-[var(--text-body)]',
  lg: 'w-14 h-14 text-[var(--text-h6)]',
};

function initials(name: string): string {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Simple deterministic color from name */
function avatarColor(name: string): string {
  const colors = [
    'bg-[var(--color-primary)] text-white',
    'bg-[var(--color-info)] text-white',
    'bg-[var(--color-success)] text-white',
    'bg-[var(--color-warning)] text-white',
    'bg-purple-500 text-white',
    'bg-pink-500 text-white',
  ];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xff;
  return colors[hash % colors.length];
}

export function Avatar({ name = '', src, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <div
        className={[
          'rounded-[var(--radius-full)] overflow-hidden flex-shrink-0 relative',
          sizes[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Image src={src} alt={name || 'Avatar'} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      aria-label={name || 'User'}
      className={[
        'rounded-[var(--radius-full)] flex-shrink-0 flex items-center justify-center font-semibold select-none',
        sizes[size],
        name ? avatarColor(name) : 'bg-[var(--color-divider)] text-[var(--color-text-muted)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {name ? initials(name) : '?'}
    </div>
  );
}
