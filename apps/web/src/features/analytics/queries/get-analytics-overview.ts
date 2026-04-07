import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { Database } from '@pulseops/supabase/types';
import type {
  AnalyticsBranchOption,
  AnalyticsBreakdownRow,
  AnalyticsDateRange,
  AnalyticsFilters,
  AnalyticsKpi,
  AnalyticsOverviewData,
  AnalyticsTrendPoint,
} from '@/features/analytics/types/analytics.types';
import { buildAnalyticsAiInsights } from '@/features/analytics/lib/build-analytics-ai-insights';
import {
  formatMetricDelta,
  formatMetricMinutes,
  formatMetricNumber,
  formatMetricPercent,
} from '@/features/analytics/lib/metric-formatters';

type JobRow = Pick<
  Database['public']['Tables']['jobs']['Row'],
  | 'id'
  | 'created_at'
  | 'resolved_at'
  | 'status'
  | 'priority'
  | 'location_id'
  | 'title'
  | 'reference'
  | 'due_at'
>;

type IncidentRow = Pick<
  Database['public']['Tables']['incidents']['Row'],
  'id' | 'opened_at' | 'status' | 'severity' | 'location_id'
>;

type SlaRow = Pick<
  Database['public']['Tables']['work_item_slas']['Row'],
  | 'id'
  | 'entity_type'
  | 'created_at'
  | 'location_id'
  | 'entity_id'
  | 'escalation_state'
  | 'first_response_target_minutes'
  | 'resolution_target_minutes'
  | 'first_responded_at'
  | 'resolved_at'
  | 'first_response_due_at'
  | 'resolution_due_at'
  | 'first_response_breached_at'
  | 'resolution_breached_at'
  | 'risk_level'
>;

interface Input {
  tenantId: string;
  branchId: string | null;
  filters: AnalyticsFilters;
  range: AnalyticsDateRange;
  branchName: string | null;
  branches: AnalyticsBranchOption[];
}

export async function getAnalyticsOverview({
  tenantId,
  branchId,
  filters,
  range,
  branchName,
  branches,
}: Input): Promise<AnalyticsOverviewData> {
  const supabase = await createSupabaseServerClient();
  const currentPeriod = await loadOverviewPeriod(supabase, {
    tenantId,
    branchId,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  });
  const previousPeriod =
    range.compareFrom && range.compareTo
      ? await loadOverviewPeriod(supabase, {
          tenantId,
          branchId,
          from: range.compareFrom.toISOString(),
          to: range.compareTo.toISOString(),
        })
      : null;

  return {
    filters,
    rangeLabel: formatRangeLabel(range.from, range.to),
    compareLabel:
      range.compareFrom && range.compareTo
        ? formatRangeLabel(range.compareFrom, range.compareTo)
        : null,
    scopeLabel: branchId ? `${branchName ?? 'Selected branch'} scope` : 'All branches',
    kpis: buildOverviewKpis(currentPeriod, previousPeriod),
    charts: {
      volumeTrend: buildVolumeTrend({
        from: range.from,
        to: range.to,
        jobsCreated: currentPeriod.jobsCreated,
        jobsResolved: currentPeriod.jobsResolved,
        incidentsOpened: currentPeriod.incidentsOpened,
      }),
      jobsByStatus: buildCountBreakdown(
        currentPeriod.jobsCreated.map((job) => job.status),
        'jobs in the selected window',
      ),
      jobsByPriority: buildCountBreakdown(
        currentPeriod.jobsCreated.map((job) => job.priority),
        'jobs in the selected window',
      ),
    },
    ai: buildAnalyticsAiInsights({
      branches: branchId
        ? branches.filter((branch) => branch.id === branchId)
        : branches,
      jobsCreatedCount: currentPeriod.jobsCreated.length,
      jobsResolvedCount: currentPeriod.jobsResolved.length,
      backlogCount: currentPeriod.backlogCount,
      incidentsOpened: currentPeriod.incidentsOpened.map((incident) => ({
        id: incident.id,
        locationId: incident.location_id,
      })),
      activeJobs: currentPeriod.activeJobs.map((job) => ({
        id: job.id,
        reference: job.reference,
        title: job.title,
        status: job.status,
        priority: job.priority,
        dueAt: job.due_at,
        locationId: job.location_id,
      })),
      slaSnapshots: currentPeriod.slaRows
        .filter(
          (
            snapshot,
          ): snapshot is SlaRow & {
            entity_type: 'job' | 'incident';
          } => snapshot.entity_type === 'job' || snapshot.entity_type === 'incident',
        )
        .map((snapshot) => ({
          entityId: snapshot.entity_id,
          entityType: snapshot.entity_type,
          locationId: snapshot.location_id,
          riskLevel: snapshot.risk_level,
          escalationState: snapshot.escalation_state,
          firstResponseDueAt: snapshot.first_response_due_at,
          resolutionDueAt: snapshot.resolution_due_at,
          firstResponseBreachedAt: snapshot.first_response_breached_at,
          resolutionBreachedAt: snapshot.resolution_breached_at,
        })),
    }),
  };
}

async function loadOverviewPeriod(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    tenantId: string;
    branchId: string | null;
    from: string;
    to: string;
  },
) {
  const [
    jobsCreatedResult,
    jobsResolvedResult,
    incidentsOpenedResult,
    slaResult,
    backlogCountResult,
    activeJobsResult,
  ] = await Promise.all([
    queryJobsCreated(supabase, input),
    queryJobsResolved(supabase, input),
    queryIncidentsOpened(supabase, input),
    querySlaSnapshots(supabase, input),
    queryOpenBacklogCount(supabase, input),
    queryActiveJobs(supabase, input),
  ]);

  return {
    jobsCreated: jobsCreatedResult,
    jobsResolved: jobsResolvedResult,
    incidentsOpened: incidentsOpenedResult,
    slaRows: slaResult,
    backlogCount: backlogCountResult,
    activeJobs: activeJobsResult,
  };
}

async function queryJobsCreated(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    tenantId: string;
    branchId: string | null;
    from: string;
    to: string;
  },
) {
  let query = supabase
    .from('jobs')
    .select('id, created_at, resolved_at, status, priority, location_id, title, reference, due_at')
    .eq('organization_id', input.tenantId)
    .gte('created_at', input.from)
    .lte('created_at', input.to);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies JobRow[];
}

async function queryJobsResolved(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    tenantId: string;
    branchId: string | null;
    from: string;
    to: string;
  },
) {
  let query = supabase
    .from('jobs')
    .select('id, created_at, resolved_at, status, priority, location_id, title, reference, due_at')
    .eq('organization_id', input.tenantId)
    .not('resolved_at', 'is', null)
    .gte('resolved_at', input.from)
    .lte('resolved_at', input.to);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies JobRow[];
}

async function queryIncidentsOpened(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    tenantId: string;
    branchId: string | null;
    from: string;
    to: string;
  },
) {
  let query = supabase
    .from('incidents')
    .select('id, opened_at, status, severity, location_id')
    .eq('organization_id', input.tenantId)
    .gte('opened_at', input.from)
    .lte('opened_at', input.to);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies IncidentRow[];
}

async function querySlaSnapshots(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    tenantId: string;
    branchId: string | null;
    from: string;
    to: string;
  },
) {
  let query = supabase
    .from('work_item_slas')
    .select(
      'id, entity_id, entity_type, created_at, location_id, escalation_state, first_response_target_minutes, resolution_target_minutes, first_responded_at, resolved_at, first_response_due_at, resolution_due_at, first_response_breached_at, resolution_breached_at, risk_level',
    )
    .eq('organization_id', input.tenantId)
    .in('entity_type', ['job', 'incident'])
    .gte('created_at', input.from)
    .lte('created_at', input.to);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies SlaRow[];
}

async function queryOpenBacklogCount(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    tenantId: string;
    branchId: string | null;
    to: string;
  },
) {
  let query = supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', input.tenantId)
    .lte('created_at', input.to)
    .in('status', ['new', 'scheduled', 'in_progress', 'blocked']);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function queryActiveJobs(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    tenantId: string;
    branchId: string | null;
  },
) {
  let query = supabase
    .from('jobs')
    .select('id, created_at, resolved_at, status, priority, location_id, title, reference, due_at')
    .eq('organization_id', input.tenantId)
    .in('status', ['new', 'scheduled', 'in_progress', 'blocked']);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies JobRow[];
}

function buildOverviewKpis(
  current: Awaited<ReturnType<typeof loadOverviewPeriod>>,
  previous: Awaited<ReturnType<typeof loadOverviewPeriod>> | null,
): AnalyticsKpi[] {
  const currentMedianResolution = calculateMedianResolutionMinutes(current.jobsResolved);
  const previousMedianResolution = previous
    ? calculateMedianResolutionMinutes(previous.jobsResolved)
    : null;
  const currentFirstResponseRate = calculateFirstResponseRate(current.slaRows, current.jobsCreated);
  const previousFirstResponseRate = previous
    ? calculateFirstResponseRate(previous.slaRows, previous.jobsCreated)
    : null;
  const currentResolutionRate = calculateResolutionRate(current.slaRows, current.jobsCreated);
  const previousResolutionRate = previous
    ? calculateResolutionRate(previous.slaRows, previous.jobsCreated)
    : null;
  const currentBreachCount = calculateBreachCount(current.slaRows, current.jobsCreated);
  const previousBreachCount = previous
    ? calculateBreachCount(previous.slaRows, previous.jobsCreated)
    : null;

  return [
    buildKpiCard(
      'Jobs created',
      current.jobsCreated.length,
      previous?.jobsCreated.length ?? null,
      'count',
      'Opened in the selected reporting window',
      formatMetricNumber,
    ),
    buildKpiCard(
      'Jobs resolved',
      current.jobsResolved.length,
      previous?.jobsResolved.length ?? null,
      'count',
      'Completed with a recorded resolution timestamp',
      formatMetricNumber,
    ),
    buildKpiCard(
      'Open backlog',
      current.backlogCount,
      previous?.backlogCount ?? null,
      'count',
      'Jobs still active at the end of the reporting window',
      formatMetricNumber,
    ),
    buildKpiCard(
      'Incident volume',
      current.incidentsOpened.length,
      previous?.incidentsOpened.length ?? null,
      'count',
      'Incidents opened in the selected reporting window',
      formatMetricNumber,
    ),
    buildKpiCard(
      'Median resolution',
      currentMedianResolution,
      previousMedianResolution,
      'minutes',
      'Median job resolution time for resolved jobs',
      formatMetricMinutes,
    ),
    buildKpiCard(
      'First response SLA',
      currentFirstResponseRate,
      previousFirstResponseRate,
      'percent',
      'Combined jobs and incidents responded to on time',
      formatMetricPercent,
    ),
    buildKpiCard(
      'Resolution SLA',
      currentResolutionRate,
      previousResolutionRate,
      'percent',
      'Combined jobs and incidents resolved on time',
      formatMetricPercent,
    ),
    buildKpiCard(
      'Breach count',
      currentBreachCount,
      previousBreachCount,
      'count',
      'SLA snapshots with a first response or resolution breach',
      formatMetricNumber,
    ),
  ];
}

function buildKpiCard(
  label: string,
  currentValue: number | null,
  previousValue: number | null,
  unit: 'count' | 'percent' | 'minutes',
  helperText: string,
  formatter: (value: number | null) => string,
): AnalyticsKpi {
  const delta =
    currentValue === null || previousValue === null ? null : currentValue - previousValue;

  return {
    label,
    value: formatter(currentValue),
    helperText,
    deltaLabel: formatMetricDelta(delta, unit),
    deltaDirection: delta === null || delta === 0 ? 'neutral' : delta > 0 ? 'up' : 'down',
  };
}

function calculateMedianResolutionMinutes(rows: JobRow[]) {
  const values = rows
    .map((row) => {
      if (!row.resolved_at) {
        return null;
      }

      return (
        (new Date(row.resolved_at).getTime() - new Date(row.created_at).getTime()) /
        60000
      );
    })
    .filter((value): value is number => value !== null)
    .sort((left, right) => left - right);

  if (values.length === 0) {
    return null;
  }

  const midpoint = Math.floor(values.length / 2);
  const midpointValue = values[midpoint];

  if (midpointValue === undefined) {
    return null;
  }

  if (values.length % 2 !== 0) {
    return midpointValue;
  }

  const previousValue = values[midpoint - 1];

  if (previousValue === undefined) {
    return midpointValue;
  }

  return (previousValue + midpointValue) / 2;
}

function calculateFirstResponseRate(rows: SlaRow[], jobsCreated: JobRow[]) {
  const periodEnd = derivePeriodEnd(rows, jobsCreated.map((job) => job.created_at));
  const eligibleRows = rows.filter((row) => row.first_response_target_minutes !== null);

  if (eligibleRows.length === 0) {
    return null;
  }

  const onTimeCount = eligibleRows.filter((row) => {
    if (row.first_responded_at && !row.first_response_breached_at) {
      return true;
    }

    if (!row.first_responded_at && row.first_response_due_at) {
      return new Date(row.first_response_due_at) > periodEnd;
    }

    return false;
  }).length;

  return (onTimeCount / eligibleRows.length) * 100;
}

function calculateResolutionRate(rows: SlaRow[], jobsCreated: JobRow[]) {
  const periodEnd = derivePeriodEnd(rows, jobsCreated.map((job) => job.created_at));
  const eligibleRows = rows.filter((row) => row.resolution_target_minutes !== null);

  if (eligibleRows.length === 0) {
    return null;
  }

  const onTimeCount = eligibleRows.filter((row) => {
    if (row.resolved_at && !row.resolution_breached_at) {
      return true;
    }

    if (!row.resolved_at && row.resolution_due_at) {
      return new Date(row.resolution_due_at) > periodEnd;
    }

    return false;
  }).length;

  return (onTimeCount / eligibleRows.length) * 100;
}

function calculateBreachCount(rows: SlaRow[], jobsCreated: JobRow[]) {
  const periodEnd = derivePeriodEnd(rows, jobsCreated.map((job) => job.created_at));

  return rows.filter((row) => {
    const firstResponseBreached =
      Boolean(row.first_response_breached_at) ||
      (!row.first_responded_at &&
        row.first_response_due_at !== null &&
        new Date(row.first_response_due_at) <= periodEnd);
    const resolutionBreached =
      Boolean(row.resolution_breached_at) ||
      (!row.resolved_at &&
        row.resolution_due_at !== null &&
        new Date(row.resolution_due_at) <= periodEnd);

    return firstResponseBreached || resolutionBreached;
  }).length;
}

function derivePeriodEnd(rows: SlaRow[], fallbackDates: string[]) {
  const latestSource = [...rows.map((row) => row.created_at), ...fallbackDates].sort().at(-1);
  return latestSource ? new Date(latestSource) : new Date();
}

function buildVolumeTrend(input: {
  from: Date;
  to: Date;
  jobsCreated: JobRow[];
  jobsResolved: JobRow[];
  incidentsOpened: IncidentRow[];
}): AnalyticsTrendPoint[] {
  const buckets = new Map<string, AnalyticsTrendPoint>();

  for (
    let cursor = new Date(input.from);
    cursor <= input.to;
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
  ) {
    const key = cursor.toISOString().slice(0, 10);
    buckets.set(key, {
      label: key.slice(5),
      jobsCreated: 0,
      jobsResolved: 0,
      incidentsOpened: 0,
    });
  }

  for (const job of input.jobsCreated) {
    const point = buckets.get(job.created_at.slice(0, 10));
    if (point) {
      point.jobsCreated += 1;
    }
  }

  for (const job of input.jobsResolved) {
    if (!job.resolved_at) {
      continue;
    }

    const point = buckets.get(job.resolved_at.slice(0, 10));
    if (point) {
      point.jobsResolved += 1;
    }
  }

  for (const incident of input.incidentsOpened) {
    const point = buckets.get(incident.opened_at.slice(0, 10));
    if (point) {
      point.incidentsOpened += 1;
    }
  }

  return Array.from(buckets.values());
}

function buildCountBreakdown(values: string[], helperSuffix: string): AnalyticsBreakdownRow[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, value]) => ({
      label: label.replace(/_/g, ' '),
      value,
      helperText: `${formatMetricNumber(value)} ${helperSuffix}`,
    }));
}

function formatRangeLabel(from: Date, to: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
  }).format(from).concat(' - ').concat(
    new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(to),
  );
}
