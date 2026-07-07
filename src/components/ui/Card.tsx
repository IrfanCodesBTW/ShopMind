// ============================================================================
// Card — Core Primitive
// Source: new_Design_plan.md Task 4, Design.md §Cards
// ============================================================================

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none';
  noBorder?: boolean;
  noShadow?: boolean;
  hover?: boolean;
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'lg',
      noBorder = false,
      noShadow = false,
      hover = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={[
          'bg-[var(--color-surface)] rounded-[var(--radius-lg)]',
          !noBorder && 'border border-[var(--color-border)]',
          !noShadow && 'shadow-[var(--shadow-card)]',
          hover && 'transition-card-hover hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer',
          paddings[padding],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
