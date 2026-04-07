'use server';

import { getServerEnv } from '@pulseops/env/server';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { canManageBilling } from '@/lib/billing/billing-access';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import { getStripe } from '@/lib/stripe/server';
import { insertAuditLogInDb } from '@/features/audit/repositories/audit.repository';
import { getBillingCustomerFromDb } from '@/features/billing/repositories/billing.repository';

export async function createBillingPortalSessionAction() {
  const context = await requireTenantMember();

  if (!canManageBilling(context.membershipRole)) {
    redirect('/billing?status=forbidden' as unknown as Route);
  }

  if (
    await isServerActionRateLimited({
      bucket: 'billing:portal',
      actorId: context.viewerId,
      limit: 20,
      windowMs: 15 * 60 * 1000,
    })
  ) {
    redirect('/billing?status=rate-limited' as unknown as Route);
  }

  const env = getServerEnv();

  if (!env.STRIPE_SECRET_KEY) {
    redirect('/billing?status=billing-unavailable' as unknown as Route);
  }

  const supabase = await createSupabaseServerClient();
  const billingCustomer = await getBillingCustomerFromDb(supabase, context.tenantId);

  if (!billingCustomer) {
    redirect('/billing?status=no-customer' as unknown as Route);
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: billingCustomer.stripe_customer_id,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  await insertAuditLogInDb(supabase, {
    tenantId: context.tenantId,
    actorUserId: context.viewerId,
    action: 'billing.portal_opened',
    entityType: 'billing_customer',
    entityId: billingCustomer.id,
    entityLabel: context.tenantName,
    scope: 'billing',
    metadata: {
      stripeCustomerId: billingCustomer.stripe_customer_id,
    },
  });

  redirect(session.url as never);
}
