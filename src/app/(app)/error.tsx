// ============================================================================
// Error Boundary — Displays when an app segment throws (v2 Premium Glass)
// Source: Design.md, design-taste-frontend
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
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12 select-none">
      <Card padding="lg" className="w-full max-w-md text-center space-y-6 border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] relative overflow-hidden">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-black text-white tracking-tight uppercase">Something went wrong</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            An unexpected error occurred while rendering this page.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-slate-950 border border-white/5 rounded-[12px] text-left text-xs font-mono text-slate-400 overflow-auto max-h-24">
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
