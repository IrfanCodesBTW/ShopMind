// ============================================================================
// Transcript Normalizer — Stage 2 of AI Pipeline
// Source: AI_ARCHITECTURE.md §Stage 2: Transcript Normalization
// Deterministic pre-processing: numerals, units, currency, entities
// ============================================================================

// Hindi/Hinglish numeral dictionary
const HINDI_NUMERALS: Record<string, number> = {
  'ek': 1, 'do': 2, 'teen': 3, 'chaar': 4, 'paanch': 5,
  'chhah': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
  'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15,
  'solah': 16, 'satrah': 17, 'athaarah': 18, 'unnees': 19, 'bees': 20,
  'pachees': 25, 'tees': 30, 'chaalees': 40, 'pachaas': 50,
  'saath': 60, 'sattar': 70, 'assi': 80, 'nabbe': 90,
  'sau': 100, 'hazaar': 1000, 'hazar': 1000, 'lakh': 100000,
  // Common fractions
  'dedh': 1.5, 'dhai': 2.5, 'saadhe': 0, // saadhe is a modifier
  // Telugu basics
  'okati': 1, 'rendu': 2, 'moodu': 3, 'naalugu': 4, 'aidu': 5,
  'aaru': 6, 'edu': 7, 'enimidi': 8, 'tommidi': 9, 'padi': 10,
  'nooru': 100, 'veyyi': 1000,
};

// Unit normalization aliases
const UNIT_ALIASES: Record<string, string> = {
  'kilo': 'kg', 'kilogram': 'kg', 'kilograms': 'kg', 'kgs': 'kg',
  'gram': 'g', 'grams': 'g', 'gm': 'g',
  'liter': 'l', 'liters': 'l', 'litre': 'l', 'litres': 'l',
  'meter': 'm', 'meters': 'm', 'metre': 'm',
  'packet': 'pkt', 'packets': 'pkt', 'packs': 'pkt', 'pack': 'pkt',
  'piece': 'pc', 'pieces': 'pc', 'pcs': 'pc',
  'dozen': 'dz', 'darjan': 'dz', 'darzan': 'dz',
  'bottle': 'btl', 'bottles': 'btl',
  'bag': 'bag', 'bags': 'bag',
  'box': 'box', 'boxes': 'box',
  'tin': 'tin', 'tins': 'tin',
  'pair': 'pair', 'pairs': 'pair',
  'set': 'set', 'sets': 'set',
};

// Currency patterns
const CURRENCY_PATTERNS = [
  /(\d+)\s*(?:rupaye|rupees|rupiya|rs\.?|₹)/gi,
  /(?:rupaye|rupees|rupiya|rs\.?|₹)\s*(\d+)/gi,
];

/**
 * Normalize a raw transcript for better LLM parsing.
 * Converts Hindi/Telugu numerals, standardizes units, and formats currency.
 */
export function normalizeTranscript(raw: string): string {
  let text = raw.trim();

  // 1. Replace Hindi/Telugu numeral words with digits
  text = replaceNumeralWords(text);

  // 2. Handle compound numerals like "paanch sau" → "500", "teen hazaar" → "3000"
  text = resolveCompoundNumerals(text);

  // 3. Standardize unit names
  text = normalizeUnits(text);

  // 4. Format currency mentions
  text = normalizeCurrency(text);

  // 5. Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

function replaceNumeralWords(text: string): string {
  // Sort by length (longest first) to avoid partial matches
  const words = Object.keys(HINDI_NUMERALS).sort((a, b) => b.length - a.length);

  for (const word of words) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    text = text.replace(regex, String(HINDI_NUMERALS[word]));
  }

  return text;
}

function resolveCompoundNumerals(text: string): string {
  // Pattern: <number> sau → number * 100
  text = text.replace(/(\d+)\s+100\b/g, (_, n) => String(Number(n) * 100));

  // Pattern: <number> hazaar → number * 1000
  text = text.replace(/(\d+)\s+1000\b/g, (_, n) => String(Number(n) * 1000));

  // Pattern: <number> lakh → number * 100000
  text = text.replace(/(\d+)\s+100000\b/g, (_, n) => String(Number(n) * 100000));

  return text;
}

function normalizeUnits(text: string): string {
  const aliases = Object.keys(UNIT_ALIASES).sort((a, b) => b.length - a.length);

  for (const alias of aliases) {
    const regex = new RegExp(`\\b${alias}\\b`, 'gi');
    text = text.replace(regex, UNIT_ALIASES[alias]);
  }

  return text;
}

function normalizeCurrency(text: string): string {
  // Standardize currency markers to ₹
  for (const pattern of CURRENCY_PATTERNS) {
    text = text.replace(pattern, '₹$1');
  }

  // Also handle standalone mentions
  text = text.replace(/\b(?:rupaye|rupees|rupiya)\b/gi, '₹');

  return text;
}
