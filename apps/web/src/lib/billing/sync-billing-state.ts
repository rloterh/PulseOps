import 'server-only';

import type Stripe from 'stripe';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import {
  getBillingCustomerByStripeIdFromDb,
  upsertBillingCustomerInDb,
  upsertBillingSubscriptionFromStripeInDb,
  upsertOrganizationEntitlementsInDb,
} from '@/features/billing/repositories/billing.repository';
import { resolveEntitlementPlan } from './resolve-entitlement-plan';
import { getPlanCodeFromStripePriceId } from './stripe-prices';

export async function syncBillingFromStripeSubscription(input: {
  organizationId: string;
  stripeCustomerId: string;
  subscription: Stripe.Subscription;
}) {
  const supabase = createSupabaseAdminClient();

  await upsertBillingCustomerInDb(supabase, {
    organizationId: input.organizationId,
    stripeCustomerId: input.stripeCustomerId,
  });

  await upsertBillingSubscriptionFromStripeInDb(supabase, input);
  await upsertOrganizationEntitlementsInDb(supabase, {
    organizationId: input.organizationId,
    plan: resolveEntitlementPlan({
      status: input.subscription.status,
      matchedPlan: getPlanCodeFromStripePriceId(
        input.subscription.items.data[0]?.price.id ?? null,
      ),
    }),
  });
}

export async function resolveOrganizationIdForStripeCustomer(
  stripeCustomerId: string,
) {
  const supabase = createSupabaseAdminClient();
  const billingCustomer = await getBillingCustomerByStripeIdFromDb(
    supabase,
    stripeCustomerId,
  );

  return billingCustomer?.organization_id ?? null;
}
