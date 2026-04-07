'use server';

import { getServerEnv } from '@pulseops/env/server';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { canManageBilling } from '@/lib/billing/billing-access';
import { getStripePriceIdForPlan } from '@/lib/billing/stripe-prices';
import { syncBillingFromStripeSubscription } from '@/lib/billing/sync-billing-state';
import { getStripe } from '@/lib/stripe/server';
import { insertAuditLogInDb } from '@/features/audit/repositories/audit.repository';
import {
  getBillingCustomerFromDb,
  getBillingSubscriptionFromDb,
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
  const supabase = await createSupabaseServerClient();
  const stripe = getStripe();
  const [existingCustomer, existingSubscription] = await Promise.all([
    getBillingCustomerFromDb(admin, context.tenantId),
    getBillingSubscriptionFromDb(admin, context.tenantId),
  ]);

  let stripeCustomerId =
    existingCustomer?.stripe_customer_id ?? existingSubscription?.stripe_customer_id ?? null;

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

  if (
    existingSubscription?.stripe_subscription_id &&
    existingSubscription.plan === parsed.data.plan &&
    !existingSubscription.cancel_at_period_end
  ) {
    redirect('/billing?status=no-change' as unknown as Route);
  }

  if (
    existingSubscription?.stripe_subscription_id &&
    existingSubscription.status !== 'canceled'
  ) {
    if (!stripeCustomerId) {
      redirect('/billing?status=no-customer' as unknown as Route);
    }

    const currentSubscription = await stripe.subscriptions.retrieve(
      existingSubscription.stripe_subscription_id,
    );
    const currentItem = currentSubscription.items.data[0];

    if (!currentItem) {
      redirect('/billing?status=invalid-action' as unknown as Route);
    }

    const updatedSubscription = await stripe.subscriptions.update(
      existingSubscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: currentItem.id,
            price: priceId,
          },
        ],
        proration_behavior: 'create_prorations',
      },
    );

    await syncBillingFromStripeSubscription({
      organizationId: context.tenantId,
      stripeCustomerId,
      subscription: updatedSubscription,
    });

    await insertAuditLogInDb(supabase, {
      tenantId: context.tenantId,
      actorUserId: context.viewerId,
      action: 'billing.plan_changed',
      entityType: 'billing_subscription',
      entityId: existingSubscription.id,
      entityLabel: context.tenantName,
      scope: 'billing',
      metadata: {
        plan: parsed.data.plan,
        stripeCustomerId,
        stripeSubscriptionId: existingSubscription.stripe_subscription_id,
      },
    });

    redirect('/billing?status=plan-updated' as unknown as Route);
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

  await insertAuditLogInDb(supabase, {
    tenantId: context.tenantId,
    actorUserId: context.viewerId,
    action: 'billing.checkout_started',
    entityType: 'billing_customer',
    entityLabel: context.tenantName,
    scope: 'billing',
    metadata: {
      plan: parsed.data.plan,
      stripeCustomerId,
      stripeCheckoutSessionId: session.id,
    },
  });

  redirect(session.url as never);
}
