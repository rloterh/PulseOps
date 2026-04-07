import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getEntitlementsForPlan } from './plans';
import { getOrganizationEntitlementsFromDb } from '@/features/billing/repositories/billing.repository';

export async function getOrganizationEntitlements(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const entitlements = await getOrganizationEntitlementsFromDb(supabase, organizationId);

  if (!entitlements) {
    return getEntitlementsForPlan('free');
  }

  return {
    plan: entitlements.plan,
    maxOperators: entitlements.max_operators,
    maxSavedViews: entitlements.max_saved_views,
    canUseAdvancedFilters: entitlements.can_use_advanced_filters,
    canUseAnalytics: entitlements.can_use_analytics,
    canUsePrioritySupport: entitlements.can_use_priority_support,
  };
}
