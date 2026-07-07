// ============================================================================
// Input Sanitization — Defense against injection and XSS
// Source: SECURITY.md §Input Validation, PRD §9.2
// ============================================================================

/**
 * Sanitize user-submitted text by removing dangerous characters
 * while preserving multilingual content (Hindi, Telugu, English).
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Strip HTML tags (preserve content)
    .replace(/<[^>]*>/g, '')
    // Remove control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim excessive whitespace
    .replace(/\s{10,}/g, '  ')
    .trim();
}

/**
 * Sanitize a transcript before sending to AI models.
 * Defends against prompt injection by stripping instruction-like patterns.
 */
export function sanitizeTranscript(transcript: string): string {
  if (!transcript || typeof transcript !== 'string') return '';

  let sanitized = sanitizeText(transcript);

  // Strip common prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi,
    /system\s*:\s*/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/g,
    /<\|im_end\|>/g,
    /<<\s*SYS\s*>>/g,
    /<<\s*\/SYS\s*>>/g,
    /you\s+are\s+(now|a|an)\s/gi,
    /act\s+as\s+(a|an|if)\s/gi,
    /pretend\s+(to\s+be|you\s+are)/gi,
    /forget\s+(everything|all|your)/gi,
    /new\s+instructions?\s*:/gi,
    /override\s+(previous|all|your)/gi,
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Limit transcript length (voice recordings are max 30s, so transcripts
  // shouldn't be excessively long)
  const MAX_TRANSCRIPT_LENGTH = 2000;
  if (sanitized.length > MAX_TRANSCRIPT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_TRANSCRIPT_LENGTH);
  }

  return sanitized.trim();
}

/**
 * Sanitize an amount value — must be a positive number.
 */
export function sanitizeAmount(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > 10_000_000) return null;
  return Math.round(num * 100) / 100; // 2 decimal places
}

/**
 * Sanitize a quantity value — must be a positive number.
 */
export function sanitizeQuantity(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > 1_000_000) return null;
  return num;
}

/**
 * Validate and sanitize an enum-like string against a set of allowed values.
 */
export function sanitizeEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  if (typeof value !== 'string') return fallback;
  return allowed.includes(value as T) ? (value as T) : fallback;
}
