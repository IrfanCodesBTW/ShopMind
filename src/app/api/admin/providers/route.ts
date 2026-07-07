// ============================================================================
// GET /api/admin/providers — AI provider health and fallback status
// Source: PRD §5.2, §6
// ============================================================================

import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { getAllProviderStats, getQuota } from '@/services/rate-limiter';
import type { AIProvider } from '@/types';

// Simple in-memory fallback tracking
const fallbackCounts = new Map<string, number>();
const escalationCounts = new Map<string, number>();

export function recordFallback(from: AIProvider, to: AIProvider): void {
  const key = `${from}→${to}`;
  fallbackCounts.set(key, (fallbackCounts.get(key) || 0) + 1);
}

export function recordEscalation(provider: AIProvider): void {
  escalationCounts.set(provider, (escalationCounts.get(provider) || 0) + 1);
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  try {
    const stats = getAllProviderStats();

    const providers = stats.map((s) => {
      const quota = getQuota(s.provider, s.model);
      return {
        provider: s.provider,
        model: s.model,
        status: quota.isExhausted ? 'exhausted' : s.usagePct >= 0.8 ? 'warning' : 'healthy',
        dailyUsed: s.dailyUsed,
        dailyLimit: s.dailyLimit,
        usagePct: Math.round(s.usagePct * 100),
        remaining: s.remaining,
        tokensAvailable: s.tokensAvailable,
        rpm: s.rpm,
        quotaResetsAt: quota.resetAt.toISOString(),
      };
    });

    return successResponse({
      providers,
      fallbacks: Object.fromEntries(fallbackCounts),
      escalations: Object.fromEntries(escalationCounts),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Admin providers error:', err);
    return Errors.internal('Failed to fetch provider status');
  }
}
