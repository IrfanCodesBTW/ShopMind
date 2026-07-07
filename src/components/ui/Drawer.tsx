// ============================================================================
// Drawer — Mobile-first Slide Panel
// Source: new_Design_plan.md Task 5
// ============================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'bottom' | 'right' | 'left';
}

const sideConfig = {
  bottom: {
    container: 'items-end justify-center',
    panel: 'w-full rounded-t-[var(--radius-xl)] max-h-[90dvh]',
    enter: 'translate-y-0',
    exit: 'translate-y-full',
  },
  right: {
    container: 'items-stretch justify-end',
    panel: 'h-full w-80 max-w-[90vw] rounded-l-[var(--radius-xl)]',
    enter: 'translate-x-0',
    exit: 'translate-x-full',
  },
  left: {
    container: 'items-stretch justify-start',
    panel: 'h-full w-80 max-w-[90vw] rounded-r-[var(--radius-xl)]',
    enter: 'translate-x-0',
    exit: '-translate-x-full',
  },
};

export function Drawer({ isOpen, onClose, title, children, side = 'bottom' }: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cfg = sideConfig[side];

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      className={['fixed inset-0 flex', cfg.container].join(' ')}
      style={{ zIndex: 'var(--z-modal)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" aria-hidden />

      {/* Panel */}
      <div
        className={[
          'relative bg-[var(--color-surface)] border border-[var(--color-border)]',
          'shadow-[var(--shadow-modal)] overflow-y-auto',
          'transition-transform duration-[var(--motion-transitions-drawer)]',
          cfg.panel,
          cfg.enter,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Handle (bottom drawer) */}
        {side === 'bottom' && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" aria-hidden />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-divider)]">
            <h2 className="text-[var(--text-h6)] font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-divider)] cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 pb-safe">{children}</div>
      </div>
    </div>
  );
}
