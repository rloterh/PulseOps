import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { canViewAnalytics } from '@/features/analytics/lib/analytics.permissions';
import { resolveAnalyticsDateRange } from '@/features/analytics/lib/date-range';
import { getAnalyticsSlaMetrics } from '@/features/analytics/queries/get-analytics-sla-metrics';
import { parseAnalyticsFilters } from '@/features/analytics/schemas/analytics-filters.schema';

export async function GET(request: NextRequest) {
  const context = await requireTenantMember();

  if (!canViewAnalytics(context.membershipRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const entitlements = await getOrganizationEntitlements(context.tenantId);
  if (!entitlements.canUseAnalytics) {
    return NextResponse.json({ error: 'Analytics not enabled' }, { status: 403 });
  }

  const { data: locations, error } = await context.supabase
    .from('locations')
    .select('id, name')
    .eq('organization_id', context.tenantId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const filters = parseAnalyticsFilters(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );
  const range = resolveAnalyticsDateRange(filters);
  const payload = await getAnalyticsSlaMetrics({
    tenantId: context.tenantId,
    filters,
    range,
    branches: locations,
  });

  return NextResponse.json(payload);
}
