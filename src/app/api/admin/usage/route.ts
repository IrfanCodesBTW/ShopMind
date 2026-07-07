// ============================================================================
// GET /api/admin/usage — AI provider usage statistics
// Source: PRD §5.2, §6
// ============================================================================

import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { getAllProviderStats } from '@/services/rate-limiter';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  try {
    // Real-time in-memory stats
    const liveStats = getAllProviderStats();

    // Historical stats from database (last 7 days)
    const supabase = await createServerSupabaseClient();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: historicalUsage } = await supabase
      .from('api_usage')
      .select('provider, model, request_type, success, tokens_used, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(500);

    // Aggregate historical data by provider
    const historicalByProvider: Record<string, {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      totalTokens: number;
    }> = {};

    for (const record of historicalUsage || []) {
      const key = `${record.provider}:${record.model}`;
      if (!historicalByProvider[key]) {
        historicalByProvider[key] = {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalTokens: 0,
        };
      }
      const entry = historicalByProvider[key];
      entry.totalRequests++;
      if (record.success) entry.successfulRequests++;
      else entry.failedRequests++;
      entry.totalTokens += record.tokens_used || 0;
    }

    return successResponse({
      live: liveStats,
      historical: historicalByProvider,
      period: {
        from: sevenDaysAgo.toISOString(),
        to: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Admin usage error:', err);
    return Errors.internal('Failed to fetch usage stats');
  }
}
