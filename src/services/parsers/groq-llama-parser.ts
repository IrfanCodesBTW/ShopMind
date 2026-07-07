// ============================================================================
// Groq Llama Fallback Parser — Stage 4 of AI Pipeline
// Source: AI_ARCHITECTURE.md §Stage 4: Fallback Parser
// ============================================================================

import type {
  TransactionParser,
  ParseResult,
  MerchantContext,
  QuotaStatus,
  ParsedTransaction,
} from '@/types';

const GROQ_LLAMA_MODEL = 'llama-3.3-70b-versatile';
const TIMEOUT_MS = 8000; // Longer timeout for fallback

/**
 * Groq Llama 3.3 70B Versatile — fallback parser.
 * Activated when Gemini fails, rate-limits, or returns low confidence.
 */
export class GroqLlamaParser implements TransactionParser {
  readonly provider = 'groq' as const;
  readonly model = GROQ_LLAMA_MODEL;
  readonly priority = 2;

  async parse(transcript: string, context?: MerchantContext): Promise<ParseResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GROQ_API_KEY not configured' };
    }

    const contextBlock = context
      ? `Business: ${context.businessType}. Items: ${context.commonItems.slice(0, 10).join(', ')}. Customers: ${context.regularCustomers.slice(0, 10).join(', ')}.`
      : 'Business: general retail store.';

    const systemPrompt = `You are a transaction parser for Indian small businesses. Extract structured data from voice transcripts.
Output ONLY valid JSON, no explanation.
Schema: {"intent":"sale|expense|credit_given|credit_received|stock_update|stock_check|return","item":string|null,"quantity":number|null,"unit":string|null,"amount":number|null,"customer":string|null,"payment_mode":"cash|upi|card|credit|other"|null,"due_status":"paid|due|partial"|null,"confidence":number}

${contextBlock}

Examples:
"2 kg atta becha 80 rupaye" → {"intent":"sale","item":"atta","quantity":2,"unit":"kg","amount":80,"customer":null,"payment_mode":"cash","due_status":"paid","confidence":0.95}
"Sharma ji ko 1000 udhar diya" → {"intent":"credit_given","item":null,"quantity":null,"unit":null,"amount":1000,"customer":"Sharma ji","payment_mode":"credit","due_status":"due","confidence":0.92}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_LLAMA_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Parse: "${transcript}"` },
          ],
          temperature: 0.1,
          max_tokens: 512,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Groq Llama API ${response.status}`,
          fallbackTriggered: true,
        };
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        return { success: false, error: 'Empty response from Groq Llama', fallbackTriggered: true };
      }

      try {
        const parsed = JSON.parse(text);
        const result: ParsedTransaction = {
          intent: parsed.intent || 'sale',
          item: parsed.item || undefined,
          quantity: parsed.quantity != null ? Number(parsed.quantity) : undefined,
          unit: parsed.unit || undefined,
          amount: parsed.amount != null ? Number(parsed.amount) : undefined,
          customer: parsed.customer || undefined,
          payment_mode: parsed.payment_mode || undefined,
          due_status: parsed.due_status || undefined,
          confidence: Number(parsed.confidence) || 0.5,
          raw_transcript: transcript,
          normalized_transcript: transcript,
          provider_used: 'groq',
        };
        return { success: true, data: result };
      } catch {
        return { success: false, error: 'Invalid JSON from Groq Llama', fallbackTriggered: true };
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { success: false, error: 'Groq Llama request timed out', fallbackTriggered: true };
      }
      return {
        success: false,
        error: `Groq Llama failed: ${err instanceof Error ? err.message : 'Unknown'}`,
        fallbackTriggered: true,
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!process.env.GROQ_API_KEY;
  }

  async getQuotaStatus(): Promise<QuotaStatus> {
    return { remaining: -1, resetAt: new Date(), isExhausted: false };
  }
}
