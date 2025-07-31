'use client';

import { useLanguage } from '@/contexts/language-context';
import { translationService } from '@/lib/translation-service';
import { useState, useEffect, useCallback } from 'react';

export function useTranslations() {
  const { currentLanguage } = useLanguage();
  const [translationCache, setTranslationCache] = useState<
    Record<string, string>
  >({});

  const t = useCallback(
    async (text: string): Promise<string> => {
      const cacheKey = `${text}_${currentLanguage}`;

      // Check cache first
      if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
      }

      try {
        const translated = await translationService.translate(
          text,
          currentLanguage
        );

        // Update cache
        setTranslationCache((prev) => ({
          ...prev,
          [cacheKey]: translated
        }));

        return translated;
      } catch (error) {
        console.error('Translation error:', error);
        return text;
      }
    },
    [currentLanguage, translationCache]
  );

  // Synchronous version for immediate use (uses cache or returns original)
  const tSync = useCallback(
    (text: string): string => {
      const cacheKey = `${text}_${currentLanguage}`;
      return translationCache[cacheKey] || text;
    },
    [currentLanguage, translationCache]
  );

  // Preload common translations
  useEffect(() => {
    const commonTexts = [
      'Dashboard',
      'Products',
      'Orders',
      'Customers',
      'Analytics',
      'Settings',
      'Search...',
      'Profile',
      'Logout'
    ];

    commonTexts.forEach((text) => {
      t(text); // This will populate the cache
    });
  }, [currentLanguage, t]);

  return { t, tSync, currentLanguage };
}
