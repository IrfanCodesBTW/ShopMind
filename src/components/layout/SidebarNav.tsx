// ============================================================================
// SidebarNav — Desktop Sidebar Navigation
// Source: new_Design_plan.md Task 6, Design.md §Navigation
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Mic, Users, BarChart3, Settings, Package, Server } from 'lucide-react';

interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: SidebarNavItem[] = [
  { href: '/dashboard',    label: 'Home',         icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/transactions', label: 'Transactions',  icon: <Receipt className="w-5 h-5" /> },
  { href: '/record',       label: 'Record Voice',  icon: <Mic className="w-5 h-5" /> },
  { href: '/customers',    label: 'Khata Ledger',  icon: <Users className="w-5 h-5" /> },
  { href: '/inventory',    label: 'Inventory',     icon: <Package className="w-5 h-5" /> },
  { href: '/analytics',    label: 'Analytics',    icon: <BarChart3 className="w-5 h-5" /> },
  { href: '/admin',        label: 'Admin Panel',   icon: <Server className="w-5 h-5" /> },
  { href: '/settings',     label: 'Settings',      icon: <Settings className="w-5 h-5" /> },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col fixed top-0 bottom-0 left-0 w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] py-8 px-5 z-[150]"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary)] flex items-center justify-center shadow-[var(--shadow-sm)]">
          <Mic className="w-5 h-5 text-white" aria-hidden />
        </div>
        <span className="font-bold text-[var(--text-h6)] text-[var(--color-text-primary)] tracking-tight">
          ShopMind
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
                'text-[var(--text-sm)] font-medium transition-all duration-[var(--motion-duration-fast)] group',
                active
                  ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary-hover)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-divider)] hover:text-[var(--color-text-primary)]',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={[
                'transition-colors duration-[var(--motion-duration-fast)]',
                active ? 'text-[var(--color-primary-hover)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'
              ].join(' ')}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Indicator */}
      <div className="border-t border-[var(--color-divider)] pt-6 px-2">
        <div className="flex items-center gap-3 text-[var(--text-caption)] text-[var(--color-text-muted)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)] animate-pulse" />
          <span>Syncing with Cloud</span>
        </div>
      </div>
    </aside>
  );
}
