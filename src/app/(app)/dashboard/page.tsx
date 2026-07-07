// ============================================================================
// Dashboard Page — v2 Premium Glass Bento Dashboard
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, TrendingDown, Users, AlertTriangle, Package, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';

interface DashboardData {
  total_sales: number;
  total_expenses: number;
  total_credit_given: number;
  total_credit_received: number;
  net_revenue: number;
  transaction_count: number;
  top_items: Array<{ item: string; quantity_sold: number; revenue: number }>;
  outstanding_credit: number;
  low_stock_count: number;
}

type Period = 'today' | 'week' | 'month' | 'year';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('today');

  const { t } = useTranslation();
  const { toast } = useToast();

  async function fetchSummary() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/summary?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast(json.error?.message || 'Failed to load dashboard data', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Failed to connect to dashboard API', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary();
  }, [period]);

  const periods = useMemo<Array<{ key: Period; label: string }>>(() => [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ], []);

  return (
    <div className="space-y-10 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-[var(--text-h5)] font-black text-white tracking-tight leading-none">
            {t('dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t('dashboard.shop_insights', 'Shop Insights')}
          </p>
        </div>

        {/* Period Selector & Refresh */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex bg-white/5 p-1 border border-white/10 rounded-full">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={[
                  'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
                  period === p.key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white',
                ].join(' ')}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchSummary}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer hover:bg-white/10"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        /* Bento Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sales Card */}
          <Card padding="md" className="space-y-4 md:col-span-2 border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('dashboard.sales', 'Total Sales')}
              </span>
              <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--text-h3)] font-black text-white leading-none tracking-tight">
                ₹{data?.total_sales.toLocaleString('en-IN') || '0.00'}
              </p>
              <p className="text-xs text-slate-500 font-medium">Sales recorded over chosen period</p>
            </div>
          </Card>

          {/* Expenses Card */}
          <Card padding="md" className="space-y-4 border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('dashboard.expenses', 'Expenses')}
              </span>
              <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--text-h4)] font-black text-white leading-none tracking-tight">
                ₹{data?.total_expenses.toLocaleString('en-IN') || '0.00'}
              </p>
              <p className="text-xs text-slate-500 font-medium">Cash outflows logged</p>
            </div>
          </Card>

          {/* Net Revenue Card */}
          <Card padding="md" className="space-y-4 border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('dashboard.net_revenue', 'Net Revenue')}
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--text-h4)] font-black text-white leading-none tracking-tight">
                ₹{data?.net_revenue.toLocaleString('en-IN') || '0.00'}
              </p>
              <p className="text-xs text-slate-500 font-medium">Net profit margins</p>
            </div>
          </Card>

          {/* Khata Outstanding */}
          <Card padding="md" className="space-y-4 md:col-span-2 border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khata Credit Outstanding</span>
              <Users className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[var(--text-h3)] font-black text-yellow-400 leading-none tracking-tight">
                  ₹{data?.outstanding_credit.toLocaleString('en-IN') || '0.00'}
                </p>
                <p className="text-xs text-slate-500 font-medium">Total outstanding Udhar balances</p>
              </div>
              <Button variant="secondary" size="sm">
                <Link href="/customers">Open Khata</Link>
              </Button>
            </div>
          </Card>

          {/* Low Stock Bento Box */}
          <Card padding="md" className="space-y-4 md:col-span-2 border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock & Inventory</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-black text-white leading-none">
                    {data?.low_stock_count || 0}
                  </span>
                  {data?.low_stock_count && data.low_stock_count > 0 ? (
                    <Badge variant="warning" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                      Action Required
                    </Badge>
                  ) : (
                    <Badge variant="success">All Safe</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">Items currently below critical reorder levels</p>
              </div>
              <Button variant="secondary" size="sm">
                <Link href="/inventory">View Stock</Link>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Top Selling Items (Glass panel list) */}
      {!loading && data && data.top_items.length > 0 && (
        <Card padding="lg" className="border-white/5 space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white tracking-tight uppercase">Top Selling Items</h2>
            <p className="text-xs text-slate-400 font-medium">Most popular products in your shop by volume</p>
          </div>

          <div className="divide-y divide-white/5">
            {data.top_items.map((item, index) => (
              <div key={item.item || index} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-slate-600 w-5">#{index + 1}</span>
                  <div>
                    <p className="font-bold text-white text-sm capitalize">{item.item}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.quantity_sold} units sold</p>
                  </div>
                </div>
                <span className="font-extrabold text-blue-400 text-sm">₹{item.revenue.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
