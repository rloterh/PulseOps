import type Stripe from 'stripe';
import type { PlanCode } from './plans';

const FREE_ENTITLEMENT_STATUSES = new Set<Stripe.Subscription.Status>([
  'canceled',
  'incomplete',
  'incomplete_expired',
  'paused',
]);

export function resolveEntitlementPlan(input: {
  status: Stripe.Subscription.Status;
  matchedPlan: PlanCode;
}): PlanCode {
  if (FREE_ENTITLEMENT_STATUSES.has(input.status)) {
    return 'free';
  }

  return input.matchedPlan;
}
