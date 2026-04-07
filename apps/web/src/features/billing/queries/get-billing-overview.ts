import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { canManageBilling } from '@/lib/billing/billing-access';
import { getEntitlementsForPlan } from '@/lib/billing/plans';
import { isStripeBillingConfigured } from '@/lib/billing/stripe-prices';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import {
  getBillingCustomerFromDb,
  getBillingSubscriptionFromDb,
  getOrganizationEntitlementsFromDb,
} from '@/features/billing/repositories/billing.repository';
import type { BillingOverview } from '@/features/billing/types/billing.types';

export async function getBillingOverview(): Promise<BillingOverview> {
  const context = await requireTenantMember();
  const hasBillingAccess = canManageBilling(context.membershipRole);
  const supabase = hasBillingAccess ? await createSupabaseServerClient() : null;
  const [billingCustomer, subscription, entitlements] = supabase
    ? await Promise.all([
        getBillingCustomerFromDb(supabase, context.tenantId),
        getBillingSubscriptionFromDb(supabase, context.tenantId),
        getOrganizationEntitlementsFromDb(supabase, context.tenantId),
      ])
    : [null, null, null];

  const fallbackPlan = subscription?.plan ?? 'free';
  const effectiveEntitlements =
    entitlements
      ? {
          plan: entitlements.plan,
          maxOperators: entitlements.max_operators,
          maxSavedViews: entitlements.max_saved_views,
          canUseAdvancedFilters: entitlements.can_use_advanced_filters,
          canUseAnalytics: entitlements.can_use_analytics,
          canUsePrioritySupport: entitlements.can_use_priority_support,
        }
      : getEntitlementsForPlan(fallbackPlan);

  return {
    organizationId: context.tenantId,
    organizationName: context.tenantName,
    billingConfigured: isStripeBillingConfigured(),
    canManageBilling: hasBillingAccess,
    plan: effectiveEntitlements.plan,
    status: subscription?.status ?? 'free',
    interval: subscription?.interval ?? null,
    amountLabel:
      subscription?.amount_unit && subscription.currency
        ? new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: subscription.currency.toUpperCase(),
          }).format(subscription.amount_unit / 100)
        : null,
    trialEndsAtLabel: subscription?.trial_end
      ? formatDateTimeLabel(subscription.trial_end)
      : null,
    currentPeriodEndsAtLabel: subscription?.current_period_end
      ? formatDateTimeLabel(subscription.current_period_end)
      : null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    stripeCustomerId: billingCustomer?.stripe_customer_id ?? null,
    subscriptionId: subscription?.stripe_subscription_id ?? null,
    entitlements: effectiveEntitlements,
  };
}
