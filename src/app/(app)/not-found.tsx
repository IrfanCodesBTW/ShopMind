// ============================================================================
// Not Found Page — App 404 Route
// Source: PRD §7.3
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <Card padding="lg" className="w-full max-w-md text-center space-y-6 border-[var(--color-border)] shadow-[var(--shadow-lg)]">
        <div className="w-14 h-14 rounded-full bg-[var(--color-primary-muted)] flex items-center justify-center mx-auto">
          <HelpCircle className="w-7 h-7 text-[var(--color-primary)]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-[var(--text-h6)] font-bold text-[var(--color-text-primary)]">Page not found</h2>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] leading-relaxed max-w-xs mx-auto">
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
