// ============================================================================
// Admin Dashboard — Provider usage monitoring
// Source: PRD §5.2, §6, IMPLEMENTATION_PLAN Phase 2
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Zap, AlertTriangle, RefreshCw, Server } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';

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
    'var(--color-success)';

  return (
    <div className="w-full h-2 bg-[var(--color-divider)] rounded-[var(--radius-pill)] overflow-hidden">
      <div
        className="h-full rounded-[var(--radius-pill)] transition-all duration-500"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/providers');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, []);

  const totalFallbacks = data ? Object.values(data.fallbacks).reduce((s, v) => s + v, 0) : 0;
  const totalEscalations = data ? Object.values(data.escalations).reduce((s, v) => s + v, 0) : 0;

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">Admin Monitor</h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] font-medium">AI provider health and usage dashboard</p>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={fetchData} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* KPI Row */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="md" className="space-y-3 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-caption)] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Active Providers</span>
              <Server className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <p className="text-[var(--text-h5)] font-bold">{data?.providers.length || 0}</p>
          </Card>
          <Card padding="md" className="space-y-3 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-caption)] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Fallbacks Triggered</span>
              <Zap className="w-4 h-4 text-[var(--color-warning)]" />
            </div>
            <p className="text-[var(--text-h5)] font-bold">{totalFallbacks}</p>
          </Card>
          <Card padding="md" className="space-y-3 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-caption)] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Escalations</span>
              <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />
            </div>
            <p className="text-[var(--text-h5)] font-bold">{totalEscalations}</p>
          </Card>
        </div>
      )}

      {/* Provider Cards */}
      <div className="space-y-4">
        <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Provider Status</h2>
        {loading ? (
          [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          data?.providers.map((p) => (
            <Card key={`${p.provider}:${p.model}`} padding="md" className="space-y-4 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary-muted)] flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)] text-[var(--text-sm)] capitalize">{p.provider}</p>
                    <p className="text-[var(--text-caption)] text-[var(--color-text-muted)]">{p.model}</p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[var(--text-sm)]">
                  <span className="text-[var(--color-text-secondary)]">Daily Usage</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {p.dailyUsed} / {p.dailyLimit} ({p.usagePct}%)
                  </span>
                </div>
                <UsageBar pct={p.usagePct} />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center pt-2 border-t border-[var(--color-divider)]">
                <div>
                  <p className="text-[var(--text-caption)] text-[var(--color-text-muted)]">RPM</p>
                  <p className="text-[var(--text-sm)] font-semibold">{p.rpm}</p>
                </div>
                <div>
                  <p className="text-[var(--text-caption)] text-[var(--color-text-muted)]">Remaining</p>
                  <p className="text-[var(--text-sm)] font-semibold">{p.remaining}</p>
                </div>
                <div>
                  <p className="text-[var(--text-caption)] text-[var(--color-text-muted)]">Tokens</p>
                  <p className="text-[var(--text-sm)] font-semibold">{p.tokensAvailable}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Fallback Details */}
      {data && totalFallbacks > 0 && (
        <div className="space-y-4">
          <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fallback Details</h2>
          <Card padding="md" className="border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="space-y-3">
              {Object.entries(data.fallbacks).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between text-[var(--text-sm)]">
                  <span className="text-[var(--color-text-secondary)]">{key}</span>
                  <Badge variant="warning">{count} times</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Last updated */}
      {data && (
        <p className="text-[var(--text-caption)] text-[var(--color-text-muted)] text-center">
          Last updated: {new Date(data.timestamp).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
}
