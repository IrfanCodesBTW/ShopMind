// ============================================================================
// BottomNav — App Navigation (refactored)
// Source: new_Design_plan.md Task 6, Design.md §Navigation
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Mic, Users, Package } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  isCenter?: boolean;
}

const NAV: NavItem[] = [
  { href: '/dashboard',    label: 'Home',         icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/transactions', label: 'Transactions',  icon: <Receipt className="w-5 h-5" /> },
  { href: '/record',       label: 'Record',        icon: <Mic className="w-5 h-5" />, isCenter: true },
  { href: '/customers',    label: 'Khata',         icon: <Users className="w-5 h-5" /> },
  { href: '/inventory',    label: 'Inventory',     icon: <Package className="w-5 h-5" /> },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)]"
      style={{ zIndex: 'var(--z-sticky)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-end justify-around max-w-lg mx-auto px-2 h-16">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={[
                  'relative -top-5 w-14 h-14 rounded-[var(--radius-full)] flex items-center justify-center',
                  'shadow-[var(--shadow-lg)] text-white cursor-pointer btn-press',
                  active
                    ? 'bg-[var(--color-primary-hover)]'
                    : 'bg-[var(--color-voice-idle)]',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.icon}
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex flex-col items-center justify-center gap-0.5 touch-target px-3 py-2',
                'text-[var(--text-caption)] font-medium transition-colors duration-[var(--motion-duration-fast)]',
                active
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
