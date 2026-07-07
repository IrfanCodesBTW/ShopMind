// ============================================================================
// Feature Flags — Config-based gating for Phase 4 features
// Source: PRD §2.2, ROADMAP Phase 4
// ============================================================================

export interface FeatureFlags {
  /** WhatsApp integration for credit reminders */
  whatsapp: boolean;
  /** Offline-first transaction queue with sync */
  offline_sync: boolean;
  /** OCR scanning for receipts / bills */
  ocr_scanning: boolean;
  /** AI-powered business insights */
  ai_insights: boolean;
  /** Multi-store management */
  multi_store: boolean;
  /** Admin monitoring dashboard */
  admin_dashboard: boolean;
}

/**
 * Default feature flag values.
 * All Phase 4 features are disabled by default.
 * Toggle via environment variables: FEATURE_<FLAG_NAME>=true
 */
const DEFAULT_FLAGS: FeatureFlags = {
  whatsapp: false,
  offline_sync: false,
  ocr_scanning: false,
  ai_insights: false,
  multi_store: false,
  admin_dashboard: true, // Phase 2 — enabled
};

/**
 * Read feature flags from environment variables.
 * Env var format: FEATURE_WHATSAPP=true
 */
export function getFeatureFlags(): FeatureFlags {
  const flags = { ...DEFAULT_FLAGS };

  for (const key of Object.keys(flags) as Array<keyof FeatureFlags>) {
    const envKey = `FEATURE_${key.toUpperCase()}`;
    const envValue = process.env[envKey];
    if (envValue !== undefined) {
      flags[key] = envValue === 'true' || envValue === '1';
    }
  }

  return flags;
}

/**
 * Check if a specific feature is enabled.
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return getFeatureFlags()[flag];
}
