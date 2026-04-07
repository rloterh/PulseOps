import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { Database } from '@pulseops/supabase/types';
import { generateAnalyticsBranchAiRun } from '@/features/ai/lib/generate-analytics-branch-ai-run';
import { buildAnalyticsBranchAiSummary } from '@/features/analytics/lib/build-analytics-branch-ai-summary';
import type {
  AnalyticsBranchComparisonData,
  AnalyticsBranchComparisonRow,
  AnalyticsBranchOption,
  AnalyticsDateRange,
  AnalyticsFilters,
} from '@/features/analytics/types/analytics.types';
import {
  formatMetricNumber,
  formatMetricPercent,
} from '@/features/analytics/lib/metric-formatters';

type JobRow = Pick<
  Database['public']['Tables']['jobs']['Row'],
  'id' | 'created_at' | 'resolved_at' | 'status' | 'location_id'
>;

type IncidentRow = Pick<
  Database['public']['Tables']['incidents']['Row'],
  'id' | 'opened_at' | 'location_id'
>;

type SlaRow = Pick<
  Database['public']['Tables']['work_item_slas']['Row'],
  | 'id'
  | 'entity_type'
  | 'created_at'
  | 'location_id'
  | 'first_response_target_minutes'
  | 'resolution_target_minutes'
  | 'first_responded_at'
  | 'resolved_at'
  | 'first_response_due_at'
  | 'resolution_due_at'
  | 'first_response_breached_at'
  | 'resolution_breached_at'
>;

interface Input {
  tenantId: string;
  viewerId?: string;
  includeAi?: boolean;
  filters: AnalyticsFilters;
  range: AnalyticsDateRange;
  branches: AnalyticsBranchOption[];
}

export async function getAnalyticsBranchComparison({
  tenantId,
  viewerId,
  includeAi = true,
  filters,
  range,
  branches,
}: Input): Promise<AnalyticsBranchComparisonData> {
  const supabase = await createSupabaseServerClient();
  const currentPeriod = await loadBranchComparisonPeriod(supabase, {
    tenantId,
    branchId: filters.branchId,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  });
  const previousPeriod =
    range.compareFrom && range.compareTo
      ? await loadBranchComparisonPeriod(supabase, {
          tenantId,
          branchId: filters.branchId,
          from: range.compareFrom.toISOString(),
          to: range.compareTo.toISOString(),
        })
      : null;

  const rows = buildBranchRows({
    branches: filters.branchId
      ? branches.filter((branch) => branch.id === filters.branchId)
      : branches,
    currentPeriod,
    previousPeriod,
  });
  const rangeLabel = formatRangeLabel(range.from, range.to);
  const compareLabel =
    range.compareFrom && range.compareTo
      ? formatRangeLabel(range.compareFrom, range.compareTo)
      : null;
  const scopeLabel = filters.branchId ? 'Selected branch comparison' : 'All branch comparison';
  const baseSummary = buildAnalyticsBranchAiSummary(rows);
  const ai =
    includeAi && viewerId
      ? await generateAnalyticsBranchAiRun(supabase, {
          organizationId: tenantId,
          locationId: filters.branchId,
          viewerId,
          filters: {
            preset: filters.preset,
            from: filters.from,
            to: filters.to,
            branchId: filters.branchId,
            compare: filters.compare,
          },
          scopeLabel,
          rangeLabel,
          compareLabel,
          rows,
          summary: baseSummary,
        })
      : {
          generation: {
            runId: null,
            providerLabel: 'pulseops-deterministic',
            modelLabel: 'heuristic-branch-v1',
            promptVersion: 'sprint9-branch-v1',
            generatedAtValue: null,
            generatedAtLabel: 'Not requested',
            source: 'fresh' as const,
            fallbackReason: 'AI synthesis was skipped for this server flow.',
            feedbackRating: null,
          },
          summary: baseSummary,
        };

  return {
    filters,
    rangeLabel,
    compareLabel,
    scopeLabel,
    ai,
    rows,
    rankings: {
      resolvedVolume: [...rows]
        .sort((left, right) => right.jobsResolved - left.jobsResolved)
        .map((row) => ({
          label: row.branchName,
          value: row.jobsResolved,
          helperText: `${formatMetricNumber(row.jobsResolved)} resolved jobs`,
        })),
      firstResponseSla: rows
        .filter((row) => row.firstResponseSlaRate !== null)
        .sort(
          (left, right) =>
            (right.firstResponseSlaRate ?? -1) - (left.firstResponseSlaRate ?? -1),
        )
        .map((row) => ({
          label: row.branchName,
          value: Math.round(row.firstResponseSlaRate ?? 0),
          helperText: `${formatMetricPercent(row.firstResponseSlaRate)} first response SLA`,
        })),
      breachCount: [...rows]
        .sort((left, right) => right.breachCount - left.breachCount)
        .map((row) => ({
          label: row.branchName,
          value: row.breachCount,
          helperText: `${formatMetricNumber(row.breachCount)} breached snapshot${row.breachCount === 1 ? '' : 's'}`,
        })),
    },
  };
}

async function loadBranchComparisonPeriod(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    tenantId: string;
    branchId: string | null;
    from: string;
    to: string;
  },
) {
  const [
    jobsCreated,
    jobsResolved,
    incidentsOpened,
    slaRows,
    backlogRows,
  ] = await Promise.all([
    queryJobsCreated(supabase, input),
    queryJobsResolved(supabase, input),
    queryIncidentsOpened(supabase, input),
    querySlaSnapshots(supabase, input),
    queryBacklogRows(supabase, {
      tenantId: input.tenantId,
      branchId: input.branchId,
      to: input.to,
    }),
  ]);

  return {
    jobsCreated,
    jobsResolved,
    incidentsOpened,
    slaRows,
    backlogRows,
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
    .select('id, created_at, resolved_at, status, location_id')
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
    .select('id, created_at, resolved_at, status, location_id')
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
    .select('id, opened_at, location_id')
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
      'id, entity_type, created_at, location_id, first_response_target_minutes, resolution_target_minutes, first_responded_at, resolved_at, first_response_due_at, resolution_due_at, first_response_breached_at, resolution_breached_at',
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

async function queryBacklogRows(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    tenantId: string;
    branchId: string | null;
    to: string;
  },
) {
  let query = supabase
    .from('jobs')
    .select('id, created_at, resolved_at, status, location_id')
    .eq('organization_id', input.tenantId)
    .lte('created_at', input.to)
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

function buildBranchRows(input: {
  branches: AnalyticsBranchOption[];
  currentPeriod: Awaited<ReturnType<typeof loadBranchComparisonPeriod>>;
  previousPeriod: Awaited<ReturnType<typeof loadBranchComparisonPeriod>> | null;
}): AnalyticsBranchComparisonRow[] {
  return input.branches
    .map((branch) => {
      const currentJobsCreated = input.currentPeriod.jobsCreated.filter(
        (job) => job.location_id === branch.id,
      );
      const currentJobsResolved = input.currentPeriod.jobsResolved.filter(
        (job) => job.location_id === branch.id,
      );
      const currentIncidents = input.currentPeriod.incidentsOpened.filter(
        (incident) => incident.location_id === branch.id,
      );
      const currentSlaRows = input.currentPeriod.slaRows.filter(
        (row) => row.location_id === branch.id,
      );
      const currentBacklogRows = input.currentPeriod.backlogRows.filter(
        (job) => job.location_id === branch.id,
      );
      const previousBacklogRows = input.previousPeriod
        ? input.previousPeriod.backlogRows.filter((job) => job.location_id === branch.id)
        : [];

      return {
        branchId: branch.id,
        branchName: branch.name,
        jobsCreated: currentJobsCreated.length,
        jobsResolved: currentJobsResolved.length,
        openBacklog: currentBacklogRows.length,
        backlogDelta: input.previousPeriod
          ? currentBacklogRows.length - previousBacklogRows.length
          : null,
        incidentCount: currentIncidents.length,
        medianResolutionMinutes: calculateMedianResolutionMinutes(currentJobsResolved),
        firstResponseSlaRate: calculateFirstResponseRate(currentSlaRows),
        resolutionSlaRate: calculateResolutionRate(currentSlaRows),
        breachCount: calculateBreachCount(currentSlaRows),
      } satisfies AnalyticsBranchComparisonRow;
    })
    .sort((left, right) => {
      const responseGap =
        (right.firstResponseSlaRate ?? -1) - (left.firstResponseSlaRate ?? -1);
      if (responseGap !== 0) {
        return responseGap;
      }

      return (
        right.jobsResolved - left.jobsResolved ||
        left.breachCount - right.breachCount ||
        left.branchName.localeCompare(right.branchName)
      );
    });
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

function calculateFirstResponseRate(rows: SlaRow[]) {
  const eligibleRows = rows.filter((row) => row.first_response_target_minutes !== null);
  if (eligibleRows.length === 0) {
    return null;
  }

  const onTimeCount = eligibleRows.filter(
    (row) => row.first_responded_at && !row.first_response_breached_at,
  ).length;

  return (onTimeCount / eligibleRows.length) * 100;
}

function calculateResolutionRate(rows: SlaRow[]) {
  const eligibleRows = rows.filter((row) => row.resolution_target_minutes !== null);
  if (eligibleRows.length === 0) {
    return null;
  }

  const onTimeCount = eligibleRows.filter(
    (row) => row.resolved_at && !row.resolution_breached_at,
  ).length;

  return (onTimeCount / eligibleRows.length) * 100;
}

function calculateBreachCount(rows: SlaRow[]) {
  return rows.filter(
    (row) => Boolean(row.first_response_breached_at) || Boolean(row.resolution_breached_at),
  ).length;
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
