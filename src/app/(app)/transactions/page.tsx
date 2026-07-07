// ============================================================================
// Transactions Page — Filterable list with search, type filters
// Source: new_Design_plan.md Task 8, API_SPEC.md §GET /transactions
// ============================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonRow } from '@/components/ui/Skeleton';
import type { Transaction, Intent } from '@/types';

const ALL_INTENTS: Intent[] = ['sale', 'expense', 'credit_given', 'credit_received', 'stock_update', 'return'];

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Intent[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchTxs = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: '20', page: String(p), status: 'confirmed' });
      if (search) params.set('search', search);
      if (activeFilters.length === 1) params.set('type', activeFilters[0]);

      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      if (data.success) {
        setTxs(reset ? data.data : (prev) => [...prev, ...data.data]);
        setHasMore(data.pagination?.has_next ?? false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    fetchTxs(1, true);
  }, [search, activeFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleFilter(intent: Intent) {
    setActiveFilters((prev) =>
      prev.includes(intent) ? prev.filter((f) => f !== intent) : [...prev, intent]
    );
  }

  const isPositive = (tx: Transaction) => ['sale', 'credit_received'].includes(tx.intent);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">Transactions</h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] font-medium">Search and filter transaction logs</p>
      </div>

      {/* Search and Filters Container */}
      <Card padding="md" className="space-y-6 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
        {/* Search */}
        <Input
          placeholder="Search by item, customer name, price…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          rightIcon={search ? (
            <button onClick={() => setSearch('')} className="cursor-pointer p-1 rounded-full hover:bg-[var(--color-divider)]">
              <X className="w-4 h-4 text-[var(--color-text-muted)]" />
            </button>
          ) : undefined}
          className="!h-13" // Increase input height slightly for premium look
        />

        {/* Filter tags label + container */}
        <div className="space-y-3">
          <p className="text-[var(--text-caption)] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Filter by type</p>
          <div className="flex gap-2.5 flex-wrap">
            {ALL_INTENTS.map((intent) => (
              <button key={intent} onClick={() => toggleFilter(intent)} className="cursor-pointer">
                <Tag
                  intent={intent}
                  className={[
                    'transition-all duration-[var(--motion-duration-fast)]',
                    activeFilters.includes(intent)
                      ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 scale-102 opacity-100'
                      : 'opacity-85 hover:opacity-100'
                  ].join(' ')}
                />
              </button>
            ))}
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])} icon={<Filter className="w-4 h-4" />} className="ml-1 text-[var(--color-primary)]">
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <div className="space-y-3">
        {loading && txs.length === 0 ? (
          [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
        ) : txs.length === 0 ? (
          <Card padding="lg" className="text-center py-20 space-y-4 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-primary-muted)] flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[var(--color-text-primary)]">No matching transactions found</p>
              <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] leading-relaxed max-w-sm mx-auto">
                {search || activeFilters.length > 0
                  ? 'Try broadening your search query or clearing type filters.'
                  : 'Get started by recording a transaction using the mic button.'}
              </p>
            </div>
            {(search || activeFilters.length > 0) && (
              <div className="pt-2">
                <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setActiveFilters([]); }}>
                  Clear Search & Filters
                </Button>
              </div>
            )}
          </Card>
        ) : (
          txs.map((tx) => (
            <div
              key={tx.id}
              className={[
                'flex items-center justify-between py-4 px-5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] transition-all hover:border-[var(--color-primary)]/20 cursor-pointer',
                `tx-${tx.intent.replace('_', '-')}`
              ].join(' ')}
            >
              <div className="flex items-center gap-4 min-w-0">
                <Tag intent={tx.intent as Intent} />
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-text-primary)] truncate text-[var(--text-sm)]">
                    {tx.item || tx.intent.replace('_', ' ')}
                  </p>
                  <p className="text-[var(--text-caption)] text-[var(--color-text-muted)] mt-0.5">
                    {tx.customer_name && `${tx.customer_name} · `}
                    {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end ml-4 flex-shrink-0">
                <span className={['font-bold text-[var(--text-sm)]', isPositive(tx) ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'].join(' ')}>
                  {isPositive(tx) ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                </span>
                {tx.payment_mode && <Badge variant="neutral" className="mt-1">{tx.payment_mode}</Badge>}
              </div>
            </div>
          ))
        )}

        {hasMore && (
          <div className="pt-4">
            <Button
              variant="secondary"
              fullWidth
              loading={loading}
              onClick={() => { const next = page + 1; setPage(next); fetchTxs(next, false); }}
              className="py-3.5"
            >
              Load More Transactions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
