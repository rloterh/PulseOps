import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { canViewAnalytics } from '@/features/analytics/lib/analytics.permissions';
import { resolveAnalyticsDateRange } from '@/features/analytics/lib/date-range';
import { getAnalyticsBranchComparison } from '@/features/analytics/queries/get-analytics-branch-comparison';
import { getAnalyticsSlaMetrics } from '@/features/analytics/queries/get-analytics-sla-metrics';
import { parseAnalyticsFilters } from '@/features/analytics/schemas/analytics-filters.schema';
import { analyticsExportSchema } from '@/features/analytics/schemas/analytics-export.schema';
import { serializeAnalyticsCsv } from '@/features/analytics/lib/serialize-analytics-csv';

export async function GET(request: NextRequest) {
  const context = await requireTenantMember();

  if (!canViewAnalytics(context.membershipRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const entitlements = await getOrganizationEntitlements(context.tenantId);
  if (!entitlements.canUseAnalytics) {
    return NextResponse.json({ error: 'Analytics not enabled' }, { status: 403 });
  }

  const parsedExport = analyticsExportSchema.safeParse({
    dataset: request.nextUrl.searchParams.get('dataset'),
  });

  if (!parsedExport.success) {
    return NextResponse.json({ error: 'Invalid export dataset' }, { status: 400 });
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

  const csv =
    parsedExport.data.dataset === 'branches'
      ? buildBranchComparisonCsv(
          await getAnalyticsBranchComparison({
            tenantId: context.tenantId,
            filters,
            range,
            branches: locations,
          }),
        )
      : buildSlaMetricsCsv(
          await getAnalyticsSlaMetrics({
            tenantId: context.tenantId,
            filters,
            range,
            branches: locations,
          }),
        );

  const filename = `pulseops-${parsedExport.data.dataset}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

function buildBranchComparisonCsv(
  data: Awaited<ReturnType<typeof getAnalyticsBranchComparison>>,
) {
  return serializeAnalyticsCsv({
    columns: [
      'branch_name',
      'jobs_created',
      'jobs_resolved',
      'open_backlog',
      'backlog_delta',
      'incident_count',
      'median_resolution_minutes',
      'first_response_sla_rate',
      'resolution_sla_rate',
      'breach_count',
    ],
    rows: data.rows.map((row) => ({
      branch_name: row.branchName,
      jobs_created: row.jobsCreated,
      jobs_resolved: row.jobsResolved,
      open_backlog: row.openBacklog,
      backlog_delta: row.backlogDelta,
      incident_count: row.incidentCount,
      median_resolution_minutes: row.medianResolutionMinutes,
      first_response_sla_rate: row.firstResponseSlaRate,
      resolution_sla_rate: row.resolutionSlaRate,
      breach_count: row.breachCount,
    })),
  });
}

function buildSlaMetricsCsv(data: Awaited<ReturnType<typeof getAnalyticsSlaMetrics>>) {
  return serializeAnalyticsCsv({
    columns: [
      'item_reference',
      'item_type',
      'branch_name',
      'priority',
      'severity',
      'created_at',
      'first_response_minutes',
      'first_response_on_time',
      'resolution_minutes',
      'resolution_on_time',
    ],
    rows: data.table.map((row) => ({
      item_reference: row.itemReference,
      item_type: row.itemType,
      branch_name: row.branchName,
      priority: row.priorityLabel,
      severity: row.severityLabel,
      created_at: row.createdAtLabel,
      first_response_minutes: row.firstResponseMinutes,
      first_response_on_time: row.firstResponseOnTime,
      resolution_minutes: row.resolutionMinutes,
      resolution_on_time: row.resolutionOnTime,
    })),
  });
}
