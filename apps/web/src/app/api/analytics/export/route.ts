import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { log } from '@/lib/observability/logger';
import { buildRateLimitHeaders, enforceRateLimit } from '@/lib/security/rate-limit';
import { getRequestFingerprint } from '@/lib/security/request-fingerprint';
import { SafeError, createSafeErrorResponse } from '@/lib/security/safe-error';
import { canViewAnalytics } from '@/features/analytics/lib/analytics.permissions';
import {
  buildBranchComparisonCsv,
  buildSlaMetricsCsv,
} from '@/features/analytics/lib/build-analytics-csv';
import { resolveAnalyticsDateRange } from '@/features/analytics/lib/date-range';
import { resolveAnalyticsScope } from '@/features/analytics/lib/resolve-analytics-scope';
import { getAnalyticsBranchComparison } from '@/features/analytics/queries/get-analytics-branch-comparison';
import { getAnalyticsSlaMetrics } from '@/features/analytics/queries/get-analytics-sla-metrics';
import { parseAnalyticsFilters } from '@/features/analytics/schemas/analytics-filters.schema';
import { analyticsExportSchema } from '@/features/analytics/schemas/analytics-export.schema';

export async function GET(request: NextRequest) {
  const context = await requireTenantMember();
  const fingerprint = getRequestFingerprint(request.headers);

  let rateLimitHeaders: Record<string, string> | undefined;

  try {
    const rateLimit = enforceRateLimit({
      bucket: 'analytics:export',
      fingerprintKey: fingerprint.key,
      actorId: context.viewerId,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    rateLimitHeaders = buildRateLimitHeaders(rateLimit);

    if (!canViewAnalytics(context.membershipRole)) {
      throw new SafeError({
        code: 'FORBIDDEN',
        status: 403,
        userMessage: 'You do not have permission to export analytics.',
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

    const parsedExport = analyticsExportSchema.safeParse({
      dataset: request.nextUrl.searchParams.get('dataset'),
    });

    if (!parsedExport.success) {
      throw new SafeError({
        code: 'INVALID_EXPORT_DATASET',
        userMessage: 'Invalid analytics export dataset.',
      });
    }

    const { data: locations, error } = await context.supabase
      .from('locations')
      .select('id, name')
      .eq('organization_id', context.tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error('Failed to load analytics export scope.');
    }

    const filters = parseAnalyticsFilters(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const { filters: effectiveFilters } = resolveAnalyticsScope({
      filters,
      locations,
      shellBranchId: context.branchId,
    });
    const range = resolveAnalyticsDateRange(effectiveFilters);

    const csv =
      parsedExport.data.dataset === 'branches'
        ? buildBranchComparisonCsv(
            await getAnalyticsBranchComparison({
              tenantId: context.tenantId,
              includeAi: false,
              filters: effectiveFilters,
              range,
              branches: locations,
            }),
          )
        : buildSlaMetricsCsv(
            await getAnalyticsSlaMetrics({
              tenantId: context.tenantId,
              filters: effectiveFilters,
              range,
              branches: locations,
            }),
          );

    const filename = `pulseops-${parsedExport.data.dataset}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...rateLimitHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    log(error instanceof SafeError ? 'warn' : 'error', {
      message: 'Failed to export analytics CSV.',
      context: {
        tenantId: context.tenantId,
        viewerId: context.viewerId,
        branchId: context.branchId,
        dataset: request.nextUrl.searchParams.get('dataset'),
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return createSafeErrorResponse(
      error,
      rateLimitHeaders ? { headers: rateLimitHeaders } : {},
    );
  }
}
