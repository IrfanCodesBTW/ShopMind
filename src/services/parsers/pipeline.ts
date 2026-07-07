// ============================================================================
// AI Pipeline Orchestrator — Fallback Chain
// Source: AI_ARCHITECTURE.md §Fallback Chain Logic, PRD.md §4.3
// Tries: Gemini → Llama 70B → Local Rules → Manual Entry signal
// ============================================================================

import type { ParseResult, MerchantContext, TransactionParser } from '@/types';
import { GeminiParser } from './gemini-parser';
import { GroqLlamaParser } from './groq-llama-parser';
import { LocalRulesParser } from './local-rules-parser';
import { normalizeTranscript } from './normalizer';
import { canProceed, consumeToken, logUsage } from '@/services/rate-limiter';

// Confidence thresholds per AI_ARCHITECTURE.md §Confidence Scoring
const THRESHOLDS = {
  gemini: 0.85,
  groq: 0.75,
  local: 0.60,
} as const;

/**
 * The parsers in priority order.
 * Each parser implements TransactionParser and is tried sequentially.
 */
function createParsers(): TransactionParser[] {
  return [
    new GeminiParser(),
    new GroqLlamaParser(),
    new LocalRulesParser(),
  ];
}

export interface PipelineResult {
  /** The final parse result (may be from any stage) */
  result: ParseResult;
  /** The normalized transcript that was sent to parsers */
  normalizedTranscript: string;
  /** Which parsers were tried */
  attempts: Array<{
    provider: string;
    model: string;
    success: boolean;
    confidence?: number;
    latencyMs: number;
    error?: string;
  }>;
  /** Whether manual entry is required (all parsers failed) */
  requiresManualEntry: boolean;
}

/**
 * Run the full AI parsing pipeline with fallback chain.
 */
export async function runPipeline(
  rawTranscript: string,
  context?: MerchantContext
): Promise<PipelineResult> {
  // Stage 2: Normalize
  const normalizedTranscript = normalizeTranscript(rawTranscript);

  const parsers = createParsers();
  const attempts: PipelineResult['attempts'] = [];
  let bestResult: ParseResult = { success: false, error: 'No parsers available' };

  for (const parser of parsers) {
    // Check local configuration availability first
    const configured = await parser.isAvailable();
    if (!configured) {
      attempts.push({
        provider: parser.provider,
        model: parser.model,
        success: false,
        latencyMs: 0,
        error: 'Provider not configured (missing keys)',
      });
      continue;
    }

    // Check rate limit quota status before invoking
    if (parser.provider !== 'local' && !canProceed(parser.provider, parser.model)) {
      attempts.push({
        provider: parser.provider,
        model: parser.model,
        success: false,
        latencyMs: 0,
        error: 'Rate limit / quota safety margin reached',
      });
      continue;
    }

    const startTime = Date.now();

    try {
      const result = await parser.parse(normalizedTranscript, context);
      const latencyMs = Date.now() - startTime;

      attempts.push({
        provider: parser.provider,
        model: parser.model,
        success: result.success,
        confidence: result.data?.confidence,
        latencyMs,
        error: result.error,
      });

      // Consume tokens and log usage if not local rules
      if (parser.provider !== 'local') {
        if (result.success) {
          consumeToken(parser.provider, parser.model);
        }
        await logUsage(parser.provider, parser.model, 'parsing', 1, result.success);
      }

      if (result.success && result.data) {
        // Attach normalized transcript
        result.data.raw_transcript = rawTranscript;
        result.data.normalized_transcript = normalizedTranscript;

        bestResult = result;

        // Check if confidence is above the threshold for this parser's tier
        const threshold =
          parser.provider === 'gemini'
            ? THRESHOLDS.gemini
            : parser.provider === 'groq'
            ? THRESHOLDS.groq
            : THRESHOLDS.local;

        if (result.data.confidence >= threshold) {
          // Good enough — stop trying further parsers
          break;
        }
        // Below threshold but parsed — try next parser for potentially better result
        // but keep this as the current best
      }
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      attempts.push({
        provider: parser.provider,
        model: parser.model,
        success: false,
        latencyMs,
        error: err instanceof Error ? err.message : 'Unknown error',
      });

      if (parser.provider !== 'local') {
        await logUsage(parser.provider, parser.model, 'parsing', 0, false);
      }
    }
  }

  const requiresManualEntry = !bestResult.success;

  return {
    result: bestResult,
    normalizedTranscript,
    attempts,
    requiresManualEntry,
  };
}
