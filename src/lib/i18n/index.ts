// ============================================================================
// i18n System — Translation loader and context
// Source: DESIGN_SYSTEM, USER_FLOWS
// ============================================================================

import type { SupportedLanguage } from '@/types';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';

// Type-safe translations
export type TranslationKeys = typeof en;

const locales: Record<SupportedLanguage, TranslationKeys> = { en, hi, te };

/**
 * Get the translation dictionary for a language.
 */
export function getTranslations(lang: SupportedLanguage): TranslationKeys {
  return locales[lang] || locales.en;
}

/**
 * Get a nested translation value by dot-notation key.
 * e.g. t('dashboard.title') → 'Dashboard'
 */
export function translate(
  lang: SupportedLanguage,
  key: string,
  fallback?: string
): string {
  const dict = getTranslations(lang);
  const keys = key.split('.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = dict;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let enValue: any = locales.en;
      for (const ek of keys) {
        if (enValue && typeof enValue === 'object' && ek in enValue) {
          enValue = enValue[ek];
        } else {
          return fallback || key;
        }
      }
      return typeof enValue === 'string' ? enValue : fallback || key;
    }
  }

  return typeof value === 'string' ? value : fallback || key;
}

export const SUPPORTED_LANGUAGES: Array<{
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}> = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];
