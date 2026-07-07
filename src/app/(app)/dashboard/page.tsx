// ============================================================================
// Dashboard Page — Restyled with full design system
// Source: new_Design_plan.md Task 7, USER_FLOWS.md Flow 6
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, CreditCard, BarChart3, AlertTriangle, ArrowRight, Plus, Zap } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tag } from '@/components/ui/Tag';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { DashboardSummary, Transaction, Intent } from '@/types';

// ── Summary Card ────────────────────────────────────────────────────────────

function SummaryCard({
  label, amount, icon, color,
}: {
  label: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card padding="md" className="space-y-4 border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all">
      <div className="flex items-center justify-between">
        <p className="text-[var(--text-caption)] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">{label}</p>
        <div className={['w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center', color].join(' ')}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">
          ₹{amount.toLocaleString('en-IN')}
        </p>
      </div>
    </Card>
  );
}

// ── Transaction Row ─────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: Transaction }) {
  const isPositive = ['sale', 'credit_received'].includes(tx.intent);
  return (
    <div className={['flex items-center justify-between py-4 px-5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] transition-all hover:border-[var(--color-primary)]/20 cursor-pointer', `tx-${tx.intent.replace('_', '-')}`].join(' ')}>
      <div className="flex items-center gap-4 min-w-0">
        <Tag intent={tx.intent as Intent} />
        <div className="min-w-0">
          <p className="font-semibold text-[var(--color-text-primary)] truncate text-[var(--text-sm)]">
            {tx.item || tx.intent.replace('_', ' ')}
          </p>
          {tx.customer_name && (
            <p className="text-[var(--text-caption)] text-[var(--color-text-muted)] truncate mt-0.5">{tx.customer_name}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end flex-shrink-0 ml-4">
        <span className={['font-bold text-[var(--text-sm)]', isPositive ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'].join(' ')}>
          {isPositive ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
        </span>
        <span className="text-[var(--text-caption)] text-[var(--color-text-muted)] mt-0.5">
          {new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, tRes] = await Promise.all([
          fetch('/api/dashboard/summary?period=today'),
          fetch('/api/transactions?per_page=8&status=confirmed'),
        ]);
        const sData = await sRes.json();
        const tData = await tRes.json();
        if (sData.success) setSummary(sData.data);
        if (tData.success) setTxs(tData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">Dashboard</h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] font-medium" suppressHydrationWarning>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {(summary?.low_stock_count ?? 0) > 0 && (
          <Badge variant="warning" icon={<AlertTriangle className="w-4 h-4" />}>
            {summary!.low_stock_count} low stock items
          </Badge>
        )}
      </div>

      {/* Summary Grid — Responsive layout (2 columns mobile, 4 columns desktop) */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <SummaryCard
            label="Sales"
            amount={summary?.total_sales ?? 0}
            icon={<TrendingUp className="w-5 h-5 text-[var(--color-income)]" />}
            color="bg-green-50 dark:bg-green-950/20 border border-green-150 dark:border-green-900/30"
          />
          <SummaryCard
            label="Expenses"
            amount={summary?.total_purchases ?? 0}
            icon={<TrendingDown className="w-5 h-5 text-[var(--color-expense)]" />}
            color="bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30"
          />
          <SummaryCard
            label="Credit Given"
            amount={summary?.total_credit_given ?? 0}
            icon={<CreditCard className="w-5 h-5 text-[var(--color-credit-given)]" />}
            color="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-150 dark:border-yellow-900/30"
          />
          <SummaryCard
            label="Net Revenue"
            amount={summary?.net_revenue ?? 0}
            icon={<BarChart3 className="w-5 h-5 text-[var(--color-info)]" />}
            color="bg-blue-50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/30"
          />
        </div>
      )}

      {/* Main Content Split: Left panel (Transactions), Right panel (Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Transactions (wider) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Recent Transactions</h2>
            <Link href="/transactions" className="text-[var(--text-sm)] text-[var(--color-primary)] font-semibold flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : txs.length > 0 ? (
              txs.map((tx) => <TxRow key={tx.id} tx={tx} />)
            ) : (
              /* Empty state */
              <Card padding="lg" className="text-center py-16 space-y-4 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
                <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-primary-muted)] flex items-center justify-center mx-auto">
                  <BarChart3 className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-[var(--color-text-primary)]">No transactions recorded today</p>
                  <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] leading-relaxed max-w-sm mx-auto">
                    Use your voice to record sales, expenses, and customer credit quickly.
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="primary" icon={<Plus className="w-4 h-4" />} size="sm">
                    <Link href="/record">Record Transaction</Link>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right Side: Insights panel (sticky) */}
        <div className="space-y-6">
          <div className="pb-2 border-b border-[var(--color-border)]">
            <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Shop Insights</h2>
          </div>

          <Card padding="md" className="border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
            <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2 text-[var(--text-sm)]">
              <Zap className="w-4 h-4 text-[var(--color-primary)]" />
              Quick Tips
            </h3>
            <ul className="space-y-3 text-[var(--text-sm)] text-[var(--color-text-secondary)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[var(--color-primary)] mt-0.5">•</span>
                <span>You can speak in <strong>Hindi</strong> or <strong>Telugu</strong> to record sales instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[var(--color-primary)] mt-0.5">•</span>
                <span>Regularly check <strong>Khata</strong> to send credit reminders to customers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[var(--color-primary)] mt-0.5">•</span>
                <span>Net revenue shows today&apos;s cash balance after deducting expenses.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
