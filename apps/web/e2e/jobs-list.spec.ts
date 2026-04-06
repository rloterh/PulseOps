import { expect, test } from '@playwright/test';
import { HAS_E2E_AUTH, signInToPulseOps } from './helpers/auth';

test.describe('jobs list productivity', () => {
  test.skip(!HAS_E2E_AUTH, 'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run jobs E2E flows.');

  test('syncs filters into the URL and saves a reusable view', async ({ page }) => {
    const savedViewName = `Jobs view ${String(Date.now())}`;

    await signInToPulseOps(page, '/jobs');
    await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();

    await page.getByLabel('Search').fill('pump');
    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('pump');

    await page.getByLabel('Priority').selectOption('high');
    await expect.poll(() => new URL(page.url()).searchParams.get('priority')).toBe('high');

    await page.getByLabel('Saved view name').fill(savedViewName);
    await page.getByRole('button', { name: 'Save view' }).click();

    await expect(page.getByRole('link', { name: savedViewName })).toBeVisible();
  });

  test('reveals the bulk toolbar when rows are selected', async ({ page }) => {
    await signInToPulseOps(page, '/jobs');
    await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();

    const firstRowCheckbox = page.locator('tbody input[type="checkbox"]').first();
    await firstRowCheckbox.check();

    await expect(page.getByText(/job selected/i)).toBeVisible();
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText(/Select visible jobs/i)).toBeVisible();
  });
});
