import { describe, expect, it } from 'vitest';
import { getBillingFlashPresentation } from './get-billing-flash-presentation';

describe('getBillingFlashPresentation', () => {
  it('returns a success message for checkout success', () => {
    expect(getBillingFlashPresentation('checkout-success')).toMatchObject({
      tone: 'success',
      title: 'Checkout completed',
    });
  });

  it('returns a danger message for forbidden access', () => {
    expect(getBillingFlashPresentation('forbidden')).toMatchObject({
      tone: 'danger',
      title: 'Billing access denied',
    });
  });

  it('returns null for unknown statuses', () => {
    expect(getBillingFlashPresentation('not-real')).toBeNull();
  });
});
