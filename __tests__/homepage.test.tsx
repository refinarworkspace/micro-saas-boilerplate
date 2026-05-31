/**
 * Homepage unit test — verifies the hero, a feature, a pricing tier and an FAQ
 * entry render with the real English copy.
 */
import * as React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import enMessages from '@/i18n/messages/en.json';

// The homepage uses locale-aware navigation + a server-only metadata helper.
// Mock both so the component renders in jsdom.
jest.mock('@/i18n/routing', () => {
  const React = require('react');
  return {
    Link: ({ href, children, ...props }: any) =>
      React.createElement('a', { href: typeof href === 'string' ? href : '#', ...props }, children),
    usePathname: () => '/',
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
    redirect: jest.fn(),
    locales: ['en', 'zh', 'es'],
    localeNames: { en: 'English', zh: '中文', es: 'Español' },
    routing: { locales: ['en', 'zh', 'es'], defaultLocale: 'en' },
  };
});

jest.mock('@/components/SEOHead', () => ({
  buildMetadata: jest.fn(async () => ({})),
  generateMetadata: jest.fn(async () => ({})),
}));

// Imported after the mocks above are registered.
import HomePage from '@/app/[locale]/page';

describe('HomePage', () => {
  it('renders the hero headline', () => {
    renderWithProviders(<HomePage />);
    expect(
      screen.getByRole('heading', { name: enMessages.Home.headline, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders the features section title', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(enMessages.Home.features.title)).toBeInTheDocument();
    // First feature item title from messages.
    expect(
      screen.getByText(enMessages.Home.features.items[0].title)
    ).toBeInTheDocument();
  });

  it('renders pricing tiers', () => {
    renderWithProviders(<HomePage />);
    // Tier names appear in the pricing preview.
    expect(
      screen.getAllByText(enMessages.Pricing.tiers.pro.name).length
    ).toBeGreaterThan(0);
  });

  it('renders the FAQ questions', () => {
    renderWithProviders(<HomePage />);
    expect(
      screen.getByText(enMessages.Home.faq.items[0].question)
    ).toBeInTheDocument();
  });

  it('renders the bottom CTA banner', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(enMessages.Home.ctaBanner.title)).toBeInTheDocument();
  });
});
