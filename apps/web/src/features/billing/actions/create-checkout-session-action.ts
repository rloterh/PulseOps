'use server';

import { getServerEnv } from '@pulseops/env/server';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { canManageBilling } from '@/lib/billing/billing-access';
import { getStripePriceIdForPlan } from '@/lib/billing/stripe-prices';
import { getStripe } from '@/lib/stripe/server';
import {
  getBillingCustomerFromDb,
  upsertBillingCustomerInDb,
} from '@/features/billing/repositories/billing.repository';

const checkoutSchema = z.object({
  plan: z.enum(['pro', 'business']),
});

export async function createCheckoutSessionAction(formData: FormData) {
  const parsed = checkoutSchema.safeParse({
    plan: formData.get('plan'),
  });

  const context = await requireTenantMember();

  if (!canManageBilling(context.membershipRole)) {
    redirect('/billing?status=forbidden' as unknown as Route);
  }

  if (!parsed.success) {
    redirect('/pricing?status=invalid-plan' as unknown as Route);
  }

  const env = getServerEnv();
  const priceId = getStripePriceIdForPlan(parsed.data.plan);

  if (!env.STRIPE_SECRET_KEY || !priceId) {
    redirect('/pricing?status=billing-unavailable' as unknown as Route);
  }

  const admin = createSupabaseAdminClient();
  const stripe = getStripe();
  const existingCustomer = await getBillingCustomerFromDb(admin, context.tenantId);

  let stripeCustomerId = existingCustomer?.stripe_customer_id ?? null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: context.tenantName,
      email: context.viewerEmail,
      metadata: {
        organization_id: context.tenantId,
      },
    });

    stripeCustomerId = customer.id;

    await upsertBillingCustomerInDb(admin, {
      organizationId: context.tenantId,
      stripeCustomerId,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    client_reference_id: context.tenantId,
    metadata: {
      organization_id: context.tenantId,
      plan: parsed.data.plan,
    },
    subscription_data: {
      metadata: {
        organization_id: context.tenantId,
        plan: parsed.data.plan,
      },
    },
    allow_promotion_codes: true,
    success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?status=checkout-success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?status=checkout-canceled`,
  });

  if (!session.url) {
    redirect('/pricing?status=checkout-error' as unknown as Route);
  }

  redirect(session.url as never);
}
