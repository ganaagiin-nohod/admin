'use client';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import { ActiveThemeProvider } from '../active-theme';
import { ApolloProviderWrapper } from '../providers/apollo-provider';
import { LanguageProvider } from '@/contexts/language-context';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const clerkBaseTheme = mounted && resolvedTheme === 'dark' ? dark : undefined;

  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <LanguageProvider>
          <ClerkProvider
            appearance={{
              baseTheme: clerkBaseTheme
            }}
          >
            <ApolloProviderWrapper>{children}</ApolloProviderWrapper>
          </ClerkProvider>
        </LanguageProvider>
      </ActiveThemeProvider>
    </>
  );
}
