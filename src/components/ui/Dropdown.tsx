// ============================================================================
// Dropdown Primitive — Frosted Glass Dropdown Menu
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DropdownItem {
  key: string;
  label: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={[
            'absolute mt-2 w-56 rounded-[18px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 shadow-2xl z-dropdown animate-modal-enter origin-top',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
        >
          <div className="space-y-0.5" role="menu">
            {items.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={[
                  'w-full text-left px-4 py-2.5 rounded-[12px] text-sm font-medium transition-colors cursor-pointer block select-none',
                  item.disabled
                    ? 'opacity-40 pointer-events-none'
                    : 'text-slate-300 hover:text-white hover:bg-white/5',
                ].join(' ')}
                role="menuitem"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
