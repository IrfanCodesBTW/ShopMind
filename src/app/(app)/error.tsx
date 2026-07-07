// ============================================================================
// Error Boundary — Displays when an app segment throws
// Source: PRD §7.3, §9.2
// ============================================================================

'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Segment Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <Card padding="lg" className="w-full max-w-md text-center space-y-6 border-[var(--color-border)] shadow-[var(--shadow-lg)]">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7 text-[var(--color-danger)]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-[var(--text-h6)] font-bold text-[var(--color-text-primary)]">Something went wrong</h2>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] leading-relaxed max-w-xs mx-auto">
            An unexpected error occurred while rendering this page.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-[var(--color-bg)] rounded-[var(--radius-sm)] border border-[var(--color-border)] text-left text-xs font-mono text-[var(--color-text-secondary)] overflow-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="primary" fullWidth onClick={() => reset()} icon={<RotateCcw className="w-4 h-4" />}>
            Try Again
          </Button>
          <Button variant="secondary" fullWidth icon={<Home className="w-4 h-4" />}>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
