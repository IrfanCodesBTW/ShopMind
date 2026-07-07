// ============================================================================
// Drawer Primitive — Liquid Glass Sliding Panel
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
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
    <div className="fixed inset-0 z-modal flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-slate-950/80 backdrop-blur-3xl border-l border-white/10 p-6 md:p-8 shadow-2xl flex flex-col justify-between z-10 animate-drawer-enter">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6 flex-shrink-0">
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-white"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-6 min-h-0 scrollbar-thin">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
