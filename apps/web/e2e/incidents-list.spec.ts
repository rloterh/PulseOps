import { expect, test } from '@playwright/test';
import { HAS_E2E_AUTH, signInToPulseOps } from './helpers/auth';

test.describe('incidents list productivity', () => {
  test.skip(!HAS_E2E_AUTH, 'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run incident E2E flows.');

  test('syncs incident filters and saves a reusable view', async ({ page }) => {
    const savedViewName = `Incident view ${String(Date.now())}`;

    await signInToPulseOps(page, '/incidents');
    await expect(page.getByRole('heading', { name: 'Incidents' })).toBeVisible();

    await page.getByLabel('Search').fill('roof');
    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('roof');

    await page.getByLabel('Severity').selectOption('critical');
    await expect.poll(() => new URL(page.url()).searchParams.get('severity')).toBe('critical');

    await page.getByLabel('Saved view name').fill(savedViewName);
    await page.getByRole('button', { name: 'Save view' }).click();

    await expect(page.getByRole('link', { name: savedViewName })).toBeVisible();
  });

  test('reveals the bulk toolbar when incidents are selected', async ({ page }) => {
    await signInToPulseOps(page, '/incidents');
    await expect(page.getByRole('heading', { name: 'Incidents' })).toBeVisible();

    const firstRowCheckbox = page.locator('tbody input[type="checkbox"]').first();
    await firstRowCheckbox.check();

    await expect(page.getByText(/incident selected/i)).toBeVisible();
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(
      page.getByText(/Select visible incidents to move multiple records/i),
    ).toBeVisible();
  });
});
