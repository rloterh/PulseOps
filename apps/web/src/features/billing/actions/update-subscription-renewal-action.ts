'use server';

import { getServerEnv } from '@pulseops/env/server';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { canManageBilling } from '@/lib/billing/billing-access';
import { syncBillingFromStripeSubscription } from '@/lib/billing/sync-billing-state';
import { getStripe } from '@/lib/stripe/server';
import { getBillingSubscriptionFromDb } from '@/features/billing/repositories/billing.repository';

const renewalSchema = z.object({
  intent: z.enum(['cancel', 'resume']),
});

export async function updateSubscriptionRenewalAction(formData: FormData) {
  const parsed = renewalSchema.safeParse({
    intent: formData.get('intent'),
  });

  const context = await requireTenantMember();

  if (!canManageBilling(context.membershipRole)) {
    redirect('/billing?status=forbidden' as unknown as Route);
  }

  if (!parsed.success) {
    redirect('/billing?status=invalid-action' as unknown as Route);
  }

  const env = getServerEnv();

  if (!env.STRIPE_SECRET_KEY) {
    redirect('/billing?status=billing-unavailable' as unknown as Route);
  }

  const admin = createSupabaseAdminClient();
  const subscription = await getBillingSubscriptionFromDb(admin, context.tenantId);

  if (!subscription?.stripe_subscription_id || !subscription.stripe_customer_id) {
    redirect('/billing?status=no-subscription' as unknown as Route);
  }

  const stripe = getStripe();
  const updatedSubscription = await stripe.subscriptions.update(
    subscription.stripe_subscription_id,
    {
      cancel_at_period_end: parsed.data.intent === 'cancel',
    },
  );

  await syncBillingFromStripeSubscription({
    organizationId: context.tenantId,
    stripeCustomerId: subscription.stripe_customer_id,
    subscription: updatedSubscription,
  });

  redirect(
    (parsed.data.intent === 'cancel'
      ? '/billing?status=cancel-scheduled'
      : '/billing?status=cancel-resumed') as unknown as Route,
  );
}
