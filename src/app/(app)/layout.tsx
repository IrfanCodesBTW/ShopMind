// ============================================================================
// App Layout — wraps authenticated pages with Responsive Navigation
// Source: new_Design_plan.md Task 6, DESIGN_SYSTEM.md
// Supports mobile BottomNav & desktop SidebarNav
// ============================================================================

import React from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-dvh bg-[var(--color-bg)] flex flex-col md:flex-row">
          {/* Sidebar Nav (Desktop only) */}
          <SidebarNav />

          {/* Main content wrapper */}
          <div className="flex-1 pb-24 md:pb-8 md:pl-64 min-h-dvh">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
              {children}
            </main>
          </div>

          {/* Bottom Nav (Mobile only) */}
          <div className="md:hidden">
            <BottomNav />
          </div>

          {/* Feedback Widget */}
          <FeedbackWidget />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
