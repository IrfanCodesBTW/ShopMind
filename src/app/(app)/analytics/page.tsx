// ============================================================================
// Analytics Page — v2 Premium Glass Business Analytics
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';

interface MonthlyData {
  name: string;
  sales: number;
  expenses: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'30' | '90' | 'all'>('30');

  const { t } = useTranslation();
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock historical data mapping forKirana dashboard (since no API was defined for full historical chart,
      // we generate realistic metrics from transactions or mock data representing their timeline).
      setTimeout(() => {
        setData([
          { name: 'Jan', sales: 45000, expenses: 18000 },
          { name: 'Feb', sales: 52000, expenses: 22000 },
          { name: 'Mar', sales: 49000, expenses: 15000 },
          { name: 'Apr', sales: 63000, expenses: 28000 },
          { name: 'May', sales: 58000, expenses: 20000 },
          { name: 'Jun', sales: 71000, expenses: 25000 },
          { name: 'Jul', sales: 85000, expenses: 31000 },
        ]);
        setLoading(false);
      }, 800);
    } catch (e) {
      console.error(e);
      toast('Failed to load analytics data', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, [range]);

  const totalSales = data.reduce((s, d) => s + d.sales, 0);
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0);
  const netRevenue = totalSales - totalExpenses;

  return (
    <div className="space-y-8 max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-[var(--text-h5)] font-black text-white tracking-tight leading-none">
            {t('analytics.title', 'Analytics')}
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t('analytics.subtitle', 'Analyze sales performance and business trends')}
          </p>
        </div>

        {/* Range filter */}
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 border border-white/10 rounded-full">
            <button
              onClick={() => setRange('30')}
              className={[
                'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
                range === '30' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white',
              ].join(' ')}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setRange('90')}
              className={[
                'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
                range === '90' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white',
              ].join(' ')}
            >
              Last 3 Months
            </button>
          </div>
          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <SkeletonCard />
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card padding="md" className="border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('analytics.sales_today', 'Sales Volume')}
              </span>
              <p className="text-[var(--text-h4)] font-black text-white leading-none tracking-tight">
                ₹{totalSales.toLocaleString('en-IN')}
              </p>
            </Card>

            <Card padding="md" className="border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('analytics.expenses_today', 'Expenses Incurred')}
              </span>
              <p className="text-[var(--text-h4)] font-black text-white leading-none tracking-tight">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </p>
            </Card>

            <Card padding="md" className="border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('analytics.net_revenue', 'Net Revenue')}
              </span>
              <p className="text-[var(--text-h4)] font-black text-blue-400 leading-none tracking-tight">
                ₹{netRevenue.toLocaleString('en-IN')}
              </p>
            </Card>
          </div>

          {/* Area Chart: Sales vs Expenses */}
          <Card padding="lg" className="border-white/5 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('analytics.cash_flow', 'Cash Flow Overview')}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {t('analytics.cash_flow_desc', 'Sales vs Expenses trends over time')}
              </p>
            </div>

            <div className="h-80 w-full text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
