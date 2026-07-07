// ============================================================================
// Rate Limiter — Token-bucket per AI provider
// Source: AI_ARCHITECTURE.md §Quota Management, PRD §5
// ============================================================================

import { createAdminSupabaseClient } from '@/lib/supabase/server';
import type {
  AIProvider,
  RateLimiterConfig,
  TokenBucketState,
  QuotaStatus,
  RequestType,
} from '@/types';

// ── Default Provider Configs ────────────────────────────────────────────────

const PROVIDER_CONFIGS: Record<string, RateLimiterConfig> = {
  'gemini:gemini-2.5-flash': {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    rpm: 30,
    tpm: 1_000_000,
    dailyLimit: 1500,
    safetyMarginPct: 0.8,
  },
  'groq:whisper-large-v3-turbo': {
    provider: 'groq',
    model: 'whisper-large-v3-turbo',
    rpm: 20,
    tpm: 500_000,
    dailyLimit: 2000,
    safetyMarginPct: 0.8,
  },
  'groq:llama-3.3-70b-versatile': {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    rpm: 30,
    tpm: 500_000,
    dailyLimit: 1000,
    safetyMarginPct: 0.8,
  },
};

// ── In-memory bucket state (process-scoped) ─────────────────────────────────

const buckets = new Map<string, TokenBucketState>();

function getKey(provider: AIProvider, model: string): string {
  return `${provider}:${model}`;
}

function getBucket(key: string, config: RateLimiterConfig): TokenBucketState {
  const existing = buckets.get(key);
  const now = Date.now();

  if (existing) {
    // Reset daily counter if past reset time
    if (now >= existing.dailyResetAt) {
      existing.dailyUsed = 0;
      existing.dailyResetAt = getNextMidnight();
    }

    // Refill tokens based on elapsed time (1 token per interval)
    const interval = 60_000 / config.rpm; // ms between allowed requests
    const elapsed = now - existing.lastRefill;
    const refill = Math.floor(elapsed / interval);

    if (refill > 0) {
      existing.tokens = Math.min(config.rpm, existing.tokens + refill);
      existing.lastRefill = now;
    }

    return existing;
  }

  // Initialize fresh bucket
  const state: TokenBucketState = {
    tokens: config.rpm,
    lastRefill: now,
    dailyUsed: 0,
    dailyResetAt: getNextMidnight(),
  };
  buckets.set(key, state);
  return state;
}

function getNextMidnight(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

// ── Alert thresholds ────────────────────────────────────────────────────────

const ALERT_THRESHOLDS = [0.5, 0.75, 0.9] as const;
const alertsFired = new Map<string, Set<number>>();

function checkAlerts(key: string, usagePct: number): void {
  if (!alertsFired.has(key)) alertsFired.set(key, new Set());
  const fired = alertsFired.get(key)!;

  for (const threshold of ALERT_THRESHOLDS) {
    if (usagePct >= threshold && !fired.has(threshold)) {
      fired.add(threshold);
      console.warn(
        `[RateLimiter] ⚠️ ${key} at ${Math.round(usagePct * 100)}% daily quota (threshold: ${threshold * 100}%)`
      );
    }
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Check if a request can proceed for the given provider+model.
 * Returns true if under quota, false if rate limited.
 */
export function canProceed(provider: AIProvider, model: string): boolean {
  const key = getKey(provider, model);
  const config = PROVIDER_CONFIGS[key];
  if (!config) return true; // Unknown provider = no limiting

  const bucket = getBucket(key, config);
  const dailyPct = bucket.dailyUsed / config.dailyLimit;

  // Check alerts
  checkAlerts(key, dailyPct);

  // Daily limit exhausted
  if (bucket.dailyUsed >= config.dailyLimit) return false;

  // Safety margin — trigger fallback before hard limit
  if (dailyPct >= config.safetyMarginPct) return false;

  // Token bucket (RPM) check
  if (bucket.tokens <= 0) return false;

  return true;
}

/**
 * Consume a token for the given provider+model.
 * Call after a successful request.
 */
export function consumeToken(provider: AIProvider, model: string): void {
  const key = getKey(provider, model);
  const config = PROVIDER_CONFIGS[key];
  if (!config) return;

  const bucket = getBucket(key, config);
  bucket.tokens = Math.max(0, bucket.tokens - 1);
  bucket.dailyUsed += 1;
}

/**
 * Get the current quota status for a provider+model.
 */
export function getQuota(provider: AIProvider, model: string): QuotaStatus {
  const key = getKey(provider, model);
  const config = PROVIDER_CONFIGS[key];

  if (!config) {
    return { remaining: Infinity, resetAt: new Date(), isExhausted: false };
  }

  const bucket = getBucket(key, config);
  const remaining = Math.max(0, config.dailyLimit - bucket.dailyUsed);

  return {
    remaining,
    resetAt: new Date(bucket.dailyResetAt),
    isExhausted: remaining === 0,
  };
}

/**
 * Check if the safety margin has been hit (should trigger fallback).
 */
export function shouldFallback(provider: AIProvider, model: string): boolean {
  return !canProceed(provider, model);
}

/**
 * Get usage stats for all configured providers (for admin dashboard).
 */
export function getAllProviderStats(): Array<{
  provider: AIProvider;
  model: string;
  dailyUsed: number;
  dailyLimit: number;
  usagePct: number;
  remaining: number;
  tokensAvailable: number;
  rpm: number;
}> {
  return Object.entries(PROVIDER_CONFIGS).map(([key, config]) => {
    const bucket = getBucket(key, config);
    return {
      provider: config.provider,
      model: config.model,
      dailyUsed: bucket.dailyUsed,
      dailyLimit: config.dailyLimit,
      usagePct: bucket.dailyUsed / config.dailyLimit,
      remaining: Math.max(0, config.dailyLimit - bucket.dailyUsed),
      tokensAvailable: bucket.tokens,
      rpm: config.rpm,
    };
  });
}

/**
 * Log an API usage record to the database (async, fire-and-forget).
 */
export async function logUsage(
  provider: AIProvider,
  model: string,
  requestType: RequestType,
  tokensUsed: number,
  success: boolean
): Promise<void> {
  try {
    const admin = createAdminSupabaseClient();
    await admin.from('api_usage').insert({
      provider,
      model,
      tokens_used: tokensUsed,
      request_type: requestType,
      success,
    });
  } catch (err) {
    // Non-critical — don't crash the request
    console.error('[RateLimiter] Failed to log usage:', err);
  }
}
