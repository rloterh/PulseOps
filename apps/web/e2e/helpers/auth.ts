import { expect, type Page } from '@playwright/test';

export const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL ?? '';
export const E2E_USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? '';
export const HAS_E2E_AUTH = Boolean(E2E_USER_EMAIL && E2E_USER_PASSWORD);

export async function signInToPulseOps(page: Page, nextPath: string) {
  const next = encodeURIComponent(nextPath);

  await page.goto(`/sign-in?next=${next}`);
  await page.getByLabel('Email').fill(E2E_USER_EMAIL);
  await page.getByLabel('Password').fill(E2E_USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'));
  await page.goto(nextPath);
  await expect(page).toHaveURL(new RegExp(escapeRegExp(nextPath)));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
