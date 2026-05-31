import * as React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/ThemeProvider';
import enMessages from '@/i18n/messages/en.json';

/**
 * Shared render helper that wraps a component in the providers it expects:
 * the next-intl message provider (English) and the next-themes provider.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <NextIntlClientProvider
          locale="en"
          messages={enMessages as Record<string, unknown>}
          timeZone="UTC"
        >
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export { enMessages };
export * from '@testing-library/react';
