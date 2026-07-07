// ============================================================================
// Analytics Page — Refined charts with Recharts + token colors
// Source: new_Design_plan.md Task 8, Design.md §Typography
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

type Period = 'daily' | 'weekly' | 'monthly';

interface ChartPoint {
  label: string;
  sales: number;
  expenses: number;
  net: number;
}

const MOCK_DATA: ChartPoint[] = [
  { label: 'Mon', sales: 4200, expenses: 1200, net: 3000 },
  { label: 'Tue', sales: 6800, expenses: 2100, net: 4700 },
  { label: 'Wed', sales: 3100, expenses: 900,  net: 2200 },
  { label: 'Thu', sales: 7400, expenses: 3000, net: 4400 },
  { label: 'Fri', sales: 5600, expenses: 1700, net: 3900 },
  { label: 'Sat', sales: 9200, expenses: 2400, net: 6800 },
  { label: 'Sun', sales: 2800, expenses: 800,  net: 2000 },
];

function StatCard({ label, value, trend, icon }: { label: string; value: number; trend: number; icon: React.ReactNode }) {
  return (
    <Card padding="md" className="space-y-4 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-caption)] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-secondary)]">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[var(--text-h5)] font-bold tracking-tight">₹{value.toLocaleString('en-IN')}</p>
        <p className={['text-[var(--text-sm)] font-medium flex items-center gap-1 mt-1.5', trend >= 0 ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'].join(' ')}>
          {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{Math.abs(trend)}% vs last week</span>
        </p>
      </div>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-dropdown)] space-y-2">
      <p className="text-[var(--text-sm)] font-bold text-[var(--color-text-secondary)]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-3 text-[var(--text-sm)]">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="capitalize text-[var(--color-text-secondary)]">{p.name}:</span>
            <span className="font-bold text-[var(--color-text-primary)]">₹{p.value.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [period]);

  const totalSales   = data.reduce((s, d) => s + d.sales, 0);
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0);
  const netRevenue   = data.reduce((s, d) => s + d.net, 0);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">Analytics</h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] font-medium">Analyze sales performance and business trends</p>
        </div>
        <div className="flex gap-1.5 bg-[var(--color-surface)] p-1 border border-[var(--color-border)] rounded-[var(--radius-md)] self-start sm:self-center">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="py-1 px-3 !h-8 font-semibold"
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Sales Today" value={totalSales} trend={12} icon={<TrendingUp className="w-4 h-4 text-[var(--color-income)]" />} />
          <StatCard label="Expenses Today" value={totalExpenses} trend={-5} icon={<TrendingDown className="w-4 h-4 text-[var(--color-expense)]" />} />
          <StatCard label="Net Revenue" value={netRevenue} trend={18} icon={<BarChart3 className="w-4 h-4 text-[var(--color-info)]" />} />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Area chart */}
        <Card padding="lg" className="space-y-6 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <div className="space-y-1">
            <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Cash Flow Overview</h2>
            <p className="text-[var(--text-caption)] text-[var(--color-text-muted)]">Sales vs Expenses trends over time</p>
          </div>
          {loading ? (
            <div className="h-64 animate-skeleton rounded-[var(--radius-md)]" />
          ) : (
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sales-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenses-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E53935" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-divider)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted)', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)', fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="sales" stroke="#2D6A4F" strokeWidth={2.5} fill="url(#sales-grad)" name="Sales" />
                  <Area type="monotone" dataKey="expenses" stroke="#E53935" strokeWidth={2.5} fill="url(#expenses-grad)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Bar chart */}
        <Card padding="lg" className="space-y-6 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <div className="space-y-1">
            <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Net Daily Revenue</h2>
            <p className="text-[var(--text-caption)] text-[var(--color-text-muted)]">Net profits after subtracting expenses</p>
          </div>
          {loading ? (
            <div className="h-60 animate-skeleton rounded-[var(--radius-md)]" />
          ) : (
            <div className="h-60 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-divider)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted)', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)', fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="net" fill="#2D6A4F" radius={[4, 4, 0, 0]} name="Net Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
