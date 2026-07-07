// ============================================================================
// Local Rules Parser — Stage 6 of AI Pipeline
// Source: AI_ARCHITECTURE.md §Stage 6: Local Rules Parser
// Deterministic regex/dictionary-based parser, zero API cost.
// ============================================================================

import type {
  TransactionParser,
  ParseResult,
  QuotaStatus,
  ParsedTransaction,
  Intent,
} from '@/types';

const FIXED_CONFIDENCE = 0.60;

// ── Sale patterns ──────────────────────────────────────────────────────────

const SALE_PATTERNS: Array<{ regex: RegExp; extract: (m: RegExpMatchArray) => Partial<ParsedTransaction> }> = [
  {
    // "5 kg rice becha 250 rupaye" or "2 kg atta sold 80"
    regex: /(\d+(?:\.\d+)?)\s*(kg|g|l|pkt|pc|dz|btl|bag|box)\s+(.+?)\s+(?:becha|bech|sold|sell)\s+(?:₹)?(\d+(?:\.\d+)?)/i,
    extract: (m) => ({ quantity: Number(m[1]), unit: m[2], item: m[3].trim(), amount: Number(m[4]) }),
  },
  {
    // "rice becha 5 ka 250"
    regex: /(.+?)\s+(?:becha|bech|sold)\s+(\d+(?:\.\d+)?)\s*(?:ka|ke|ki)?\s*(?:₹)?(\d+(?:\.\d+)?)/i,
    extract: (m) => ({ item: m[1].trim(), quantity: Number(m[2]), amount: Number(m[3]) }),
  },
  {
    // "sold 5 kg rice for 250"
    regex: /sold?\s+(\d+(?:\.\d+)?)\s*(kg|g|l|pkt|pc|dz|btl|bag|box)?\s*(.+?)\s+(?:for|@|at)\s*(?:₹)?(\d+(?:\.\d+)?)/i,
    extract: (m) => ({ quantity: Number(m[1]), unit: m[2] || undefined, item: m[3].trim(), amount: Number(m[4]) }),
  },
];

// ── Credit given patterns ──────────────────────────────────────────────────

const CREDIT_GIVEN_PATTERNS: Array<{ regex: RegExp; extract: (m: RegExpMatchArray) => Partial<ParsedTransaction> }> = [
  {
    // "Sharma ji ko 500 udhar diya"
    regex: /(.+?)\s+(?:ko|to)\s+(?:₹)?(\d+(?:\.\d+)?)\s+(?:udhar|credit|udhaar)\s+(?:diya|diye|di)/i,
    extract: (m) => ({ customer: m[1].trim(), amount: Number(m[2]) }),
  },
  {
    // "gave 500 credit to Sharma"
    regex: /gave?\s+(?:₹)?(\d+(?:\.\d+)?)\s+(?:credit|udhar)\s+(?:to)\s+(.+)/i,
    extract: (m) => ({ amount: Number(m[1]), customer: m[2].trim() }),
  },
];

// ── Credit received patterns ───────────────────────────────────────────────

const CREDIT_RECEIVED_PATTERNS: Array<{ regex: RegExp; extract: (m: RegExpMatchArray) => Partial<ParsedTransaction> }> = [
  {
    // "Sharma ji ne 300 diye / wapas kiya"
    regex: /(.+?)\s+(?:ne|se)\s+(?:₹)?(\d+(?:\.\d+)?)\s+(?:diye|diya|wapas|return)/i,
    extract: (m) => ({ customer: m[1].trim(), amount: Number(m[2]) }),
  },
  {
    // "received 300 from Sharma"
    regex: /received?\s+(?:₹)?(\d+(?:\.\d+)?)\s+(?:from)\s+(.+)/i,
    extract: (m) => ({ amount: Number(m[1]), customer: m[2].trim() }),
  },
];

// ── Expense patterns ───────────────────────────────────────────────────────

const EXPENSE_PATTERNS: Array<{ regex: RegExp; extract: (m: RegExpMatchArray) => Partial<ParsedTransaction> }> = [
  {
    // "bijli ka bill 500 rupaye bhara"
    regex: /(.+?)\s+(?:ka|ki|ke)\s+(?:bill|kharcha)\s+(?:₹)?(\d+(?:\.\d+)?)/i,
    extract: (m) => ({ item: m[1].trim(), amount: Number(m[2]) }),
  },
  {
    // "spent 500 on electricity"
    regex: /(?:spent|paid|kharcha)\s+(?:₹)?(\d+(?:\.\d+)?)\s+(?:on|for|per)\s+(.+)/i,
    extract: (m) => ({ amount: Number(m[1]), item: m[2].trim() }),
  },
];

// ── Stock update patterns ──────────────────────────────────────────────────

const STOCK_PATTERNS: Array<{ regex: RegExp; extract: (m: RegExpMatchArray) => Partial<ParsedTransaction> }> = [
  {
    // "50 packet chips aaye"
    regex: /(\d+(?:\.\d+)?)\s*(kg|g|l|pkt|pc|dz|btl|bag|box)?\s*(.+?)\s+(?:aaye|aaya|aayi|received|came)/i,
    extract: (m) => ({ quantity: Number(m[1]), unit: m[2] || undefined, item: m[3].trim() }),
  },
];

interface PatternGroup {
  intent: Intent;
  patterns: Array<{ regex: RegExp; extract: (m: RegExpMatchArray) => Partial<ParsedTransaction> }>;
}

const ALL_PATTERN_GROUPS: PatternGroup[] = [
  { intent: 'sale', patterns: SALE_PATTERNS },
  { intent: 'credit_given', patterns: CREDIT_GIVEN_PATTERNS },
  { intent: 'credit_received', patterns: CREDIT_RECEIVED_PATTERNS },
  { intent: 'expense', patterns: EXPENSE_PATTERNS },
  { intent: 'stock_update', patterns: STOCK_PATTERNS },
];

export class LocalRulesParser implements TransactionParser {
  readonly provider = 'local' as const;
  readonly model = 'rules-v1';
  readonly priority = 4;

  async parse(transcript: string): Promise<ParseResult> {
    for (const group of ALL_PATTERN_GROUPS) {
      for (const pattern of group.patterns) {
        const match = transcript.match(pattern.regex);
        if (match) {
          const extracted = pattern.extract(match);
          const result: ParsedTransaction = {
            intent: group.intent,
            item: extracted.item,
            quantity: extracted.quantity,
            unit: extracted.unit,
            amount: extracted.amount,
            customer: extracted.customer,
            payment_mode: group.intent === 'credit_given' ? 'credit' : 'cash',
            due_status: group.intent === 'credit_given' ? 'due' : undefined,
            confidence: FIXED_CONFIDENCE,
            raw_transcript: transcript,
            normalized_transcript: transcript,
            provider_used: 'local',
          };
          return { success: true, data: result };
        }
      }
    }

    return {
      success: false,
      error: 'No pattern matched in local rules parser',
      fallbackTriggered: true,
    };
  }

  async isAvailable(): Promise<boolean> {
    return true; // Always available — no external dependency
  }

  async getQuotaStatus(): Promise<QuotaStatus> {
    return { remaining: Infinity, resetAt: new Date(), isExhausted: false };
  }
}
