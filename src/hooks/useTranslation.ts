// ============================================================================
// useTranslation Hook — Client-side translation access
// Source: DESIGN_SYSTEM, USER_FLOWS
// ============================================================================

'use client';

import { useCallback, useMemo } from 'react';
import { translate, getTranslations } from '@/lib/i18n';
import type { SupportedLanguage } from '@/types';

/**
 * Hook that provides a translation function for the current language.
 * Language is read from the document's `lang` attribute, falling back to 'en'.
 */
export function useTranslation() {
  const lang = useMemo<SupportedLanguage>(() => {
    if (typeof document === 'undefined') return 'en';
    const docLang = document.documentElement.lang;
    if (['en', 'hi', 'te'].includes(docLang)) return docLang as SupportedLanguage;
    return 'en';
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => translate(lang, key, fallback),
    [lang]
  );

  const translations = useMemo(() => getTranslations(lang), [lang]);

  return { t, lang, translations };
}
