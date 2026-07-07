// ============================================================================
// Gemini 2.5 Flash Parser — Stage 3 (Primary Parser)
// Source: AI_ARCHITECTURE.md §Stage 3, PRD.md §4.1
// ============================================================================

import type {
  TransactionParser,
  ParseResult,
  MerchantContext,
  QuotaStatus,
  ParsedTransaction,
} from '@/types';

const GEMINI_MODEL = 'gemini-2.5-flash';
const TIMEOUT_MS = 5000;

/**
 * Build the extraction prompt with merchant context and few-shot examples.
 * Source: AI_ARCHITECTURE.md §Prompt Engineering Guidelines
 */
function buildPrompt(transcript: string, context?: MerchantContext): string {
  const contextBlock = context
    ? `
Business type: ${context.businessType}
Common items: ${context.commonItems.join(', ')}
Regular customers: ${context.regularCustomers.join(', ')}
Language: ${context.preferredLanguage}`
    : 'Business type: general retail store';

  return `You are a transaction parser for Indian small businesses (kirana stores, general stores, pharmacies).
Extract structured transaction data from the merchant's voice transcript.

Output ONLY valid JSON matching this schema:
{
  "intent": "sale" | "expense" | "credit_given" | "credit_received" | "stock_update" | "stock_check" | "return",
  "item": string | null,
  "quantity": number | null,
  "unit": string | null,
  "amount": number | null,
  "customer": string | null,
  "payment_mode": "cash" | "upi" | "card" | "credit" | "other" | null,
  "due_status": "paid" | "due" | "partial" | null,
  "confidence": number (0.0 to 1.0)
}

Context:
${contextBlock}

Examples:
Input: "2 kg atta becha 80 rupaye"
Output: {"intent":"sale","item":"atta","quantity":2,"unit":"kg","amount":80,"customer":null,"payment_mode":"cash","due_status":"paid","confidence":0.95}

Input: "Sharma ji ko 1000 udhar diya"
Output: {"intent":"credit_given","item":null,"quantity":null,"unit":null,"amount":1000,"customer":"Sharma ji","payment_mode":"credit","due_status":"due","confidence":0.92}

Input: "50 packet chips aaye"
Output: {"intent":"stock_update","item":"chips","quantity":50,"unit":"pkt","amount":null,"customer":null,"payment_mode":null,"due_status":null,"confidence":0.90}

Input: "bijli ka bill 500 rupaye bhara"
Output: {"intent":"expense","item":"electricity bill","quantity":null,"unit":null,"amount":500,"customer":null,"payment_mode":"cash","due_status":"paid","confidence":0.93}

Input: "Suresh ne 300 wapas kiye"
Output: {"intent":"credit_received","item":null,"quantity":null,"unit":null,"amount":300,"customer":"Suresh","payment_mode":"cash","due_status":null,"confidence":0.91}

Now parse this transcript:
"${transcript}"`;
}

/**
 * Parse the Gemini API response into a ParsedTransaction.
 */
function parseResponse(
  responseText: string,
  transcript: string,
  normalizedTranscript: string
): ParseResult {
  try {
    // Extract JSON from the response (Gemini may wrap it in markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Try to find a JSON object in the text
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      return { success: false, error: 'No JSON object found in response' };
    }

    const parsed = JSON.parse(objectMatch[0]);

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
      normalized_transcript: normalizedTranscript,
      provider_used: 'gemini',
    };

    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse Gemini response: ${err instanceof Error ? err.message : 'Unknown'}`,
    };
  }
}

export class GeminiParser implements TransactionParser {
  readonly provider = 'gemini' as const;
  readonly model = GEMINI_MODEL;
  readonly priority = 1;

  async parse(transcript: string, context?: MerchantContext): Promise<ParseResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY not configured' };
    }

    const prompt = buildPrompt(transcript, context);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 512,
              responseMimeType: 'application/json',
            },
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Gemini API ${response.status}: ${errorText.substring(0, 200)}`,
          fallbackTriggered: true,
        };
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return { success: false, error: 'Empty response from Gemini', fallbackTriggered: true };
      }

      return parseResponse(text, transcript, transcript);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { success: false, error: 'Gemini request timed out', fallbackTriggered: true };
      }
      return {
        success: false,
        error: `Gemini failed: ${err instanceof Error ? err.message : 'Unknown'}`,
        fallbackTriggered: true,
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!process.env.GEMINI_API_KEY;
  }

  async getQuotaStatus(): Promise<QuotaStatus> {
    // Quota is managed by the rate limiter service
    return { remaining: -1, resetAt: new Date(), isExhausted: false };
  }
}
