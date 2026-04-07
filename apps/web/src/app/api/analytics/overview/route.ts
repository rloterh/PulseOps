import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { canViewAnalytics } from '@/features/analytics/lib/analytics.permissions';
import { resolveAnalyticsDateRange } from '@/features/analytics/lib/date-range';
import { getAnalyticsOverview } from '@/features/analytics/queries/get-analytics-overview';
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
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const filters = parseAnalyticsFilters(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );
  const effectiveBranchId = filters.branchId ?? context.branchId ?? null;
  const range = resolveAnalyticsDateRange({
    ...filters,
    branchId: effectiveBranchId,
  });
  const selectedBranch =
    locations.find((location) => location.id === effectiveBranchId) ?? null;
  const payload = await getAnalyticsOverview({
    tenantId: context.tenantId,
    branchId: effectiveBranchId,
    filters: {
      ...filters,
      branchId: effectiveBranchId,
    },
    range,
    branchName: selectedBranch?.name ?? context.branchName,
  });

  return NextResponse.json(payload);
}
