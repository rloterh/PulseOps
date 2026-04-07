import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { log } from '@/lib/observability/logger';
import { buildRateLimitHeaders, enforceRateLimit } from '@/lib/security/rate-limit';
import { getRequestFingerprint } from '@/lib/security/request-fingerprint';
import { SafeError, createSafeErrorResponse } from '@/lib/security/safe-error';
import { canViewAnalytics } from '@/features/analytics/lib/analytics.permissions';
import { resolveAnalyticsDateRange } from '@/features/analytics/lib/date-range';
import { resolveAnalyticsScope } from '@/features/analytics/lib/resolve-analytics-scope';
import { getAnalyticsOverview } from '@/features/analytics/queries/get-analytics-overview';
import { parseAnalyticsFilters } from '@/features/analytics/schemas/analytics-filters.schema';

export async function GET(request: NextRequest) {
  const context = await requireTenantMember();
  const fingerprint = getRequestFingerprint(request.headers);

  let rateLimitHeaders: Record<string, string> | undefined;

  try {
    const rateLimit = enforceRateLimit({
      bucket: 'analytics:overview',
      fingerprintKey: fingerprint.key,
      actorId: context.viewerId,
      limit: 60,
      windowMs: 15 * 60 * 1000,
    });
    rateLimitHeaders = buildRateLimitHeaders(rateLimit);

    if (!canViewAnalytics(context.membershipRole)) {
      throw new SafeError({
        code: 'FORBIDDEN',
        status: 403,
        userMessage: 'You do not have permission to view analytics.',
      });
    }

    const entitlements = await getOrganizationEntitlements(context.tenantId);

    if (!entitlements.canUseAnalytics) {
      throw new SafeError({
        code: 'ANALYTICS_DISABLED',
        status: 403,
        userMessage: 'Analytics is not enabled on the current plan.',
      });
    }

    const { data: locations, error } = await context.supabase
      .from('locations')
      .select('id, name')
      .eq('organization_id', context.tenantId)
      .eq('is_active', true);

    if (error) {
      throw new Error('Failed to load analytics scope.');
    }

    const filters = parseAnalyticsFilters(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const { filters: effectiveFilters, selectedBranch } = resolveAnalyticsScope({
      filters,
      locations,
      shellBranchId: context.branchId,
    });
    const range = resolveAnalyticsDateRange(effectiveFilters);
    const payload = await getAnalyticsOverview({
      tenantId: context.tenantId,
      branchId: effectiveFilters.branchId,
      viewerId: context.viewerId,
      filters: effectiveFilters,
      range,
      branchName: selectedBranch?.name ?? context.branchName,
      branches: locations,
    });

    return NextResponse.json(payload, {
      headers: rateLimitHeaders,
    });
  } catch (error) {
    log(error instanceof SafeError ? 'warn' : 'error', {
      message: 'Failed to load analytics overview.',
      context: {
        tenantId: context.tenantId,
        viewerId: context.viewerId,
        branchId: context.branchId,
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return createSafeErrorResponse(
      error,
      rateLimitHeaders ? { headers: rateLimitHeaders } : {},
    );
  }
}
