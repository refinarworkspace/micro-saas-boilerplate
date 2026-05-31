import { test, expect } from '@playwright/test';

/**
 * End-to-end smoke test: locale redirect, homepage content, navigation to the
 * tools, and using the color converter client-side.
 */

test('redirects to a locale and shows the hero', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/(en|zh|es)(\/)?$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('navigates from the homepage to the tools index', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('link', { name: 'Tools', exact: true }).first().click();
  await expect(page).toHaveURL(/\/en\/tools/);
  await expect(
    page.getByRole('heading', { name: 'Tools', level: 1 })
  ).toBeVisible();
});

test('color converter keeps formats in sync', async ({ page }) => {
  await page.goto('/en/tools/color-converter');
  const hex = page.getByLabel('HEX');
  await hex.fill('#FF0000');
  await expect(page.getByLabel('RGB')).toHaveValue('255, 0, 0');
  await expect(page.getByLabel('HSL')).toHaveValue('0, 100%, 50%');
});

test('pricing page renders three tiers', async ({ page }) => {
  await page.goto('/en/pricing');
  await expect(page.getByText('Starter')).toBeVisible();
  await expect(page.getByText('Pro', { exact: true })).toBeVisible();
  await expect(page.getByText('Business')).toBeVisible();
});
