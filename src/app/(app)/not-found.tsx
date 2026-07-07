// ============================================================================
// Not Found Page — App 404 Route (v2 Premium Glass)
// Source: Design.md, design-taste-frontend
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12 select-none">
      <Card padding="lg" className="w-full max-w-md text-center space-y-6 border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] relative overflow-hidden">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
          <HelpCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-black text-white tracking-tight uppercase">Page not found</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Button variant="primary" fullWidth icon={<ArrowLeft className="w-4 h-4" />}>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
