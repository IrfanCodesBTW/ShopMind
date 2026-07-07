// ============================================================================
// SidebarNav — Desktop Sidebar Navigation (v2 Premium Glass)
// Source: Design.md, design-taste-frontend
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
      className="hidden md:flex flex-col fixed top-4 bottom-4 left-4 w-64 bg-slate-950/40 backdrop-blur-2xl border border-white/10 p-6 rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.28)] z-[150] justify-between"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center shadow-[0_4px_15px_rgba(59,130,246,0.3)] border border-blue-400/20">
            <Mic className="w-5 h-5 text-white" aria-hidden />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">
            ShopMind
          </span>
        </div>

        {/* Nav List */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-full',
                  'text-sm font-semibold transition-all duration-300 group relative overflow-hidden',
                  active
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={[
                  'transition-colors duration-300',
                  active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-200'
                ].join(' ')}>
                  {item.icon}
                </span>
                <span>{item.label}</span>

                {/* Subtle active glow dot */}
                {active && (
                  <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Indicator */}
      <div className="border-t border-white/5 pt-6 px-2">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
          <span>Cloud Connected</span>
        </div>
      </div>
    </aside>
  );
}
