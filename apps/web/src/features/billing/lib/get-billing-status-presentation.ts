import type { BillingOverview } from '@/features/billing/types/billing.types';

export interface BillingStatusPresentation {
  tone: 'neutral' | 'success' | 'warning' | 'danger';
  title: string;
  description: string;
}

export function getBillingStatusPresentation(
  overview: Pick<
    BillingOverview,
    'status' | 'trialEndsAtLabel' | 'currentPeriodEndsAtLabel' | 'cancelAtPeriodEnd'
  >,
): BillingStatusPresentation {
  if (overview.status === 'past_due' || overview.status === 'unpaid') {
    return {
      tone: 'danger',
      title: 'Payment attention required',
      description:
        'Stripe marked this subscription as behind on payment. Update the payment method or settle the outstanding invoice to keep premium access available.',
    };
  }

  if (overview.status === 'incomplete' || overview.status === 'incomplete_expired') {
    return {
      tone: 'warning',
      title: 'Checkout was not completed',
      description:
        'The workspace has a subscription record, but Stripe still considers it incomplete. Re-run checkout or fix the payment method in the portal.',
    };
  }

  if (overview.status === 'trialing') {
    return {
      tone: 'warning',
      title: 'Trial currently active',
      description: overview.trialEndsAtLabel
        ? `This workspace is on trial until ${overview.trialEndsAtLabel}. Billing will convert automatically unless the subscription is changed before then.`
        : 'This workspace is currently on trial and will convert once the trial ends.',
    };
  }

  if (overview.cancelAtPeriodEnd) {
    return {
      tone: 'warning',
      title: 'Cancellation scheduled',
      description: overview.currentPeriodEndsAtLabel
        ? `The subscription will cancel at the end of the current period on ${overview.currentPeriodEndsAtLabel}. You can still resume renewal before then.`
        : 'The subscription is set to cancel at the end of the current period.',
    };
  }

  if (overview.status === 'active') {
    return {
      tone: 'success',
      title: 'Subscription active',
      description: overview.currentPeriodEndsAtLabel
        ? `Premium access is active and currently billed through ${overview.currentPeriodEndsAtLabel}.`
        : 'Premium access is active and synced from Stripe.',
    };
  }

  return {
    tone: 'neutral',
    title: 'Free plan workspace',
    description:
      'This workspace is running on the free plan until a paid Stripe subscription is started.',
  };
}
