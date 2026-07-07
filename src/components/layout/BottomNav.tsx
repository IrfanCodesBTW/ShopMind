// ============================================================================
// BottomNav — App Navigation (v2 Premium Glass)
// Source: Design.md, design-taste-frontend
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
      className="fixed bottom-4 left-4 right-4 bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-full py-2 px-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      style={{ zIndex: 'var(--z-sticky)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-12 relative">
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
                  'relative -top-5 w-14 h-14 rounded-full flex items-center justify-center',
                  'shadow-[0_8px_30px_rgba(59,130,246,0.4)] text-white cursor-pointer btn-press border border-blue-400/30',
                  active
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400',
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
                'text-[10px] font-bold tracking-wide uppercase transition-colors duration-300',
                active
                  ? 'text-blue-400 font-extrabold'
                  : 'text-slate-500 hover:text-slate-200',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={active ? 'scale-110 text-blue-400 transition-transform duration-300' : ''}>
                {item.icon}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
