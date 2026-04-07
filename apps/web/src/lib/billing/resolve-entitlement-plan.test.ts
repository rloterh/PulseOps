import { describe, expect, it } from 'vitest';
import { resolveEntitlementPlan } from './resolve-entitlement-plan';

describe('resolveEntitlementPlan', () => {
  it('returns free for canceled subscriptions even when the matched plan was paid', () => {
    expect(
      resolveEntitlementPlan({
        status: 'canceled',
        matchedPlan: 'pro',
      }),
    ).toBe('free');
  });

  it('returns free for incomplete expired subscriptions', () => {
    expect(
      resolveEntitlementPlan({
        status: 'incomplete_expired',
        matchedPlan: 'business',
      }),
    ).toBe('free');
  });

  it('keeps the matched paid plan for active subscriptions', () => {
    expect(
      resolveEntitlementPlan({
        status: 'active',
        matchedPlan: 'pro',
      }),
    ).toBe('pro');
  });
});
