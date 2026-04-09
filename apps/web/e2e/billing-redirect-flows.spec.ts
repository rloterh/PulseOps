import { expect, test } from '@playwright/test';

test.describe('billing redirect flows', () => {
  test('surfaces checkout cancellation guidance on pricing', async ({ page }) => {
    await page.goto('/pricing?status=checkout-canceled');

    await expect(
      page.getByRole('heading', {
        name: 'Plans that map directly to the product, billing rules, and entitlement checks.',
      }),
    ).toBeVisible();
    await expect(page.getByText('Checkout canceled')).toBeVisible();
    await expect(
      page.getByText(
        'Stripe checkout was canceled before a subscription was created. You can restart checkout whenever you are ready.',
      ),
    ).toBeVisible();
  });

  test('surfaces billing access denial guidance on pricing', async ({ page }) => {
    await page.goto('/pricing?status=forbidden');

    await expect(page.getByText('Billing access denied')).toBeVisible();
    await expect(
      page.getByText(
        'Only organization owners and admins can manage subscriptions, plan changes, or the Stripe portal.',
      ),
    ).toBeVisible();
  });
});
