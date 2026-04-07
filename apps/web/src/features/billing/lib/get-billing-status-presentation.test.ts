import { describe, expect, it } from 'vitest';
import { getBillingStatusPresentation } from './get-billing-status-presentation';

describe('getBillingStatusPresentation', () => {
  it('marks past_due as danger', () => {
    expect(
      getBillingStatusPresentation({
        status: 'past_due',
        trialEndsAtLabel: null,
        currentPeriodEndsAtLabel: null,
        cancelAtPeriodEnd: false,
      }),
    ).toMatchObject({
      tone: 'danger',
      title: 'Payment attention required',
    });
  });

  it('describes trialing state', () => {
    expect(
      getBillingStatusPresentation({
        status: 'trialing',
        trialEndsAtLabel: '7 Apr 2026',
        currentPeriodEndsAtLabel: null,
        cancelAtPeriodEnd: false,
      }).description,
    ).toContain('7 Apr 2026');
  });

  it('describes scheduled cancellation', () => {
    expect(
      getBillingStatusPresentation({
        status: 'active',
        trialEndsAtLabel: null,
        currentPeriodEndsAtLabel: '14 Apr 2026',
        cancelAtPeriodEnd: true,
      }),
    ).toMatchObject({
      tone: 'warning',
      title: 'Cancellation scheduled',
    });
  });
});
