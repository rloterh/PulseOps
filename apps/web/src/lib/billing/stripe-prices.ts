import 'server-only';

import { getServerEnv } from '@pulseops/env/server';
import type { PlanCode } from './plans';

export function getStripePriceIdForPlan(plan: Exclude<PlanCode, 'free'>): string | null {
  const env = getServerEnv();

  if (plan === 'pro') {
    return env.STRIPE_PRICE_PRO_MONTHLY ?? null;
  }

  return env.STRIPE_PRICE_BUSINESS_MONTHLY ?? null;
}

export function getPlanCodeFromStripePriceId(priceId: string | null | undefined): PlanCode {
  if (!priceId) {
    return 'free';
  }

  const env = getServerEnv();

  if (priceId === env.STRIPE_PRICE_PRO_MONTHLY) {
    return 'pro';
  }

  if (priceId === env.STRIPE_PRICE_BUSINESS_MONTHLY) {
    return 'business';
  }

  return 'free';
}

export function isStripeBillingConfigured() {
  const env = getServerEnv();

  return Boolean(
    env.STRIPE_SECRET_KEY &&
      env.STRIPE_WEBHOOK_SECRET &&
      env.STRIPE_PRICE_PRO_MONTHLY &&
      env.STRIPE_PRICE_BUSINESS_MONTHLY,
  );
}
