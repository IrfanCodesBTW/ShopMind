// ============================================================================
// App Layout — wraps authenticated pages with Responsive Navigation (v2 Premium)
// Source: Design.md, design-taste-frontend
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
        <div className="min-h-dvh bg-[#020617] flex flex-col md:flex-row relative">
          {/* Sidebar Nav (Desktop only) */}
          <SidebarNav />

          {/* Main content wrapper */}
          <div className="flex-grow pb-28 md:pb-8 md:pl-72 min-h-dvh">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
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
