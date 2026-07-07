// ============================================================================
// Admin Monitor — v2 Premium Glass Provider Metrics
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Zap, AlertTriangle, RefreshCw, Server } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

interface ProviderStatus {
  provider: string;
  model: string;
  status: 'healthy' | 'warning' | 'exhausted';
  dailyUsed: number;
  dailyLimit: number;
  usagePct: number;
  remaining: number;
  tokensAvailable: number;
  rpm: number;
  quotaResetsAt: string;
}

interface AdminData {
  providers: ProviderStatus[];
  fallbacks: Record<string, number>;
  escalations: Record<string, number>;
  timestamp: string;
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'danger';
  return <Badge variant={variant}>{status}</Badge>;
}

function UsageBar({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? 'var(--color-danger)' :
    pct >= 75 ? 'var(--color-warning)' :
    '#3B82F6';

  return (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/providers');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast('Failed to load admin stats', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Network error loading admin stats', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const totalFallbacks = data ? Object.values(data.fallbacks).reduce((s, v) => s + v, 0) : 0;
  const totalEscalations = data ? Object.values(data.escalations).reduce((s, v) => s + v, 0) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-[var(--text-h5)] font-black text-white tracking-tight leading-none">Admin Monitor</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">AI provider health and usage metrics</p>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={fetchData} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* KPI strip */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="md" className="space-y-3 border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Providers</span>
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-[var(--text-h4)] font-black text-white leading-none tracking-tight">{data?.providers.length || 0}</p>
          </Card>
          <Card padding="md" className="space-y-3 border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fallbacks Triggered</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-[var(--text-h4)] font-black text-yellow-400 leading-none tracking-tight">{totalFallbacks}</p>
          </Card>
          <Card padding="md" className="space-y-3 border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escalations</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-[var(--text-h4)] font-black text-red-400 leading-none tracking-tight">{totalEscalations}</p>
          </Card>
        </div>
      )}

      {/* Provider Details */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Provider Status</h2>
        {loading ? (
          [...Array(2)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          data?.providers.map((p) => (
            <Card key={`${p.provider}:${p.model}`} padding="md" className="space-y-4 border-white/5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm capitalize">{p.provider}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{p.model}</p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Daily Quota Limit</span>
                  <span className="text-white">
                    {p.dailyUsed} / {p.dailyLimit} ({p.usagePct}%)
                  </span>
                </div>
                <UsageBar pct={p.usagePct} />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center pt-3 border-t border-white/5">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">RPM Limit</p>
                  <p className="text-xs font-black text-white mt-0.5">{p.rpm}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Remaining</p>
                  <p className="text-xs font-black text-white mt-0.5">{p.remaining}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tokens</p>
                  <p className="text-xs font-black text-white mt-0.5">{p.tokensAvailable}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Fallback Metrics */}
      {data && totalFallbacks > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fallback Details</h2>
          <Card padding="md" className="border-white/5 shadow-2xl">
            <div className="space-y-3.5">
              {Object.entries(data.fallbacks).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 capitalize">{key}</span>
                  <Badge variant="warning">{count} times</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
