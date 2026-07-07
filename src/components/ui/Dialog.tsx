// ============================================================================
// Dialog Primitive — Frosted Glass Modal Overlay
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-slate-950/80 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.35)] z-10 animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
