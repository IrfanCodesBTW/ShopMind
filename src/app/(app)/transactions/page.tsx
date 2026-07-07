// ============================================================================
// Transactions Page — v2 Premium Glass Transactions Log
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Calendar, ShoppingBag, ArrowDownRight, Users, X, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';
import type { Transaction, Intent } from '@/types';

type FilterIntent = 'all' | Intent;

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterIntent>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { t } = useTranslation();
  const { toast } = useToast();

  const fetchTransactions = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: '15',
      });
      if (search) params.set('search', search);
      if (filter !== 'all') params.set('intent', filter);

      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();

      if (data.success) {
        if (append) {
          setTxs((prev) => [...prev, ...data.data]);
        } else {
          setTxs(data.data);
        }
        setHasMore(data.data.length === 15);
      } else {
        toast('Failed to load transactions', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Network error loading transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filter, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    fetchTransactions(1, false);
  }, [search, filter, fetchTransactions]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage, true);
  };

  const getIcon = (intent: Intent) => {
    switch (intent) {
      case 'sale': return <ShoppingBag className="w-4 h-4 text-green-400" />;
      case 'expense': return <ArrowDownRight className="w-4 h-4 text-red-400" />;
      case 'credit_given':
      case 'credit_received': return <Users className="w-4 h-4 text-yellow-400" />;
      default: return <Calendar className="w-4 h-4 text-slate-400" />;
    }
  };

  const getIntentLabel = (intent: Intent) => {
    return intent.replace('_', ' ');
  };

  const intentTabs: Array<{ key: FilterIntent; label: string }> = [
    { key: 'all', label: 'All Logs' },
    { key: 'sale', label: 'Sales' },
    { key: 'expense', label: 'Expenses' },
    { key: 'credit_given', label: 'Credit Given' },
    { key: 'credit_received', label: 'Credit Paid' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-[var(--text-h5)] font-black text-white tracking-tight leading-none">
            {t('transactions.title', 'Transactions')}
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t('transactions.subtitle', 'Search and filter transaction logs')}
          </p>
        </div>
        <button
          onClick={() => fetchTransactions(1, false)}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters bar */}
      <div className="space-y-4">
        {/* Search */}
        <Input
          placeholder={t('transactions.search_placeholder', 'Search by item, customer name, price…')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          rightIcon={search ? (
            <button onClick={() => setSearch('')} className="cursor-pointer p-1 rounded-full hover:bg-white/5">
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          ) : undefined}
        />

        {/* Intent Tabs */}
        <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-none">
          {intentTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={[
                'px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap cursor-pointer',
                filter === tab.key
                  ? 'bg-blue-500 text-white border-blue-400/30 shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 bg-white/5 border-white/5 hover:border-white/10',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Feed */}
      <Card padding="none" className="border-white/5 divide-y divide-white/5 overflow-hidden shadow-2xl">
        {loading && page === 1 ? (
          [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
        ) : txs.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <Filter className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">
                {t('transactions.no_results', 'No matching transactions found')}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {t('transactions.no_results_hint', 'Try broadening your search query or clearing type filters.')}
              </p>
            </div>
          </div>
        ) : (
          txs.map((tx) => (
            <div
              key={tx.id}
              className={[
                'flex items-center justify-between py-4.5 px-6 transition-colors hover:bg-white/[0.02]',
                tx.intent ? `tx-${tx.intent.replace('_', '-')}` : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                  {getIcon(tx.intent)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm capitalize truncate">
                    {tx.item || getIntentLabel(tx.intent)}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5 tracking-wider">
                    {tx.customer_name ? `Customer: ${tx.customer_name}` : 'General Cash'} &bull; {tx.payment_mode || 'Cash'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                <div className="text-right">
                  <span className={[
                    'font-black text-sm',
                    tx.intent === 'expense' || tx.intent === 'credit_given' ? 'text-red-400' : 'text-green-400'
                  ].join(' ')}>
                    {tx.intent === 'expense' || tx.intent === 'credit_given' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" size="md" onClick={loadMore}>
            {t('transactions.load_more', 'Load More Transactions')}
          </Button>
        </div>
      )}
    </div>
  );
}
