'use client';

import { useLanguage } from '@/contexts/language-context';
import { useState, useEffect } from 'react';

export function useT() {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await import(`@/translations/${currentLanguage}.json`);
        setTranslations(response.default);
      } catch (error) {
        console.error(
          `Failed to load translations for ${currentLanguage}:`,
          error
        );
        // Fallback to English
        try {
          const fallback = await import('@/translations/en.json');
          setTranslations(fallback.default);
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
        }
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const t = (text: string): string => {
    return translations[text] || text;
  };

  return t;
}
