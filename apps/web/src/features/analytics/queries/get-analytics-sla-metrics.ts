import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { Database } from '@pulseops/supabase/types';
import type {
  AnalyticsBranchOption,
  AnalyticsDateRange,
  AnalyticsFilters,
  AnalyticsSlaMetricsData,
  AnalyticsSlaTableRow,
} from '@/features/analytics/types/analytics.types';
import {
  buildSlaBreakdown,
  buildSlaSummary,
  type AnalyticsSlaEvaluationRow,
} from '@/features/analytics/lib/build-sla-metrics';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';

type SlaSnapshotRow = Pick<
  Database['public']['Tables']['work_item_slas']['Row'],
  | 'entity_id'
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

type JobLookupRow = Pick<
  Database['public']['Tables']['jobs']['Row'],
  'id' | 'reference' | 'title' | 'priority'
>;

type IncidentLookupRow = Pick<
  Database['public']['Tables']['incidents']['Row'],
  'id' | 'reference' | 'title' | 'severity'
>;

interface Input {
  tenantId: string;
  filters: AnalyticsFilters;
  range: AnalyticsDateRange;
  branches: AnalyticsBranchOption[];
}

export async function getAnalyticsSlaMetrics({
  tenantId,
  filters,
  range,
  branches,
}: Input): Promise<AnalyticsSlaMetricsData> {
  const supabase = await createSupabaseServerClient();
  const snapshots = await querySlaSnapshots(supabase, {
    tenantId,
    branchId: filters.branchId,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  });

  const jobIds = snapshots
    .filter((snapshot) => snapshot.entity_type === 'job')
    .map((snapshot) => snapshot.entity_id);
  const incidentIds = snapshots
    .filter((snapshot) => snapshot.entity_type === 'incident')
    .map((snapshot) => snapshot.entity_id);

  const [jobs, incidents] = await Promise.all([
    queryJobsByIds(supabase, jobIds),
    queryIncidentsByIds(supabase, incidentIds),
  ]);

  const jobLookup = new Map(jobs.map((job) => [job.id, job]));
  const incidentLookup = new Map(incidents.map((incident) => [incident.id, incident]));
  const branchLookup = new Map(branches.map((branch) => [branch.id, branch.name]));
  const evaluationRows = buildEvaluationRows({
    snapshots,
    branchLookup,
    jobLookup,
    incidentLookup,
    periodEnd: range.to,
  });

  return {
    filters,
    rangeLabel: formatRangeLabel(range.from, range.to),
    compareLabel:
      range.compareFrom && range.compareTo
        ? formatRangeLabel(range.compareFrom, range.compareTo)
        : null,
    scopeLabel: filters.branchId
      ? `${branchLookup.get(filters.branchId) ?? 'Selected branch'} SLA scope`
      : 'All branches SLA scope',
    summary: buildSlaSummary(evaluationRows),
    breakdowns: {
      byBranch: buildSlaBreakdown(evaluationRows, 'branch'),
      byPriority: buildSlaBreakdown(evaluationRows, 'priority'),
      bySeverity: buildSlaBreakdown(evaluationRows, 'severity'),
    },
    table: buildTableRows(evaluationRows),
  };
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
      'entity_id, entity_type, created_at, location_id, first_response_target_minutes, resolution_target_minutes, first_responded_at, resolved_at, first_response_due_at, resolution_due_at, first_response_breached_at, resolution_breached_at',
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

  return data satisfies SlaSnapshotRow[];
}

async function queryJobsByIds(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  ids: string[],
) {
  if (ids.length === 0) {
    return [] satisfies JobLookupRow[];
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('id, reference, title, priority')
    .in('id', ids);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies JobLookupRow[];
}

async function queryIncidentsByIds(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  ids: string[],
) {
  if (ids.length === 0) {
    return [] satisfies IncidentLookupRow[];
  }

  const { data, error } = await supabase
    .from('incidents')
    .select('id, reference, title, severity')
    .in('id', ids);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies IncidentLookupRow[];
}

function buildEvaluationRows(input: {
  snapshots: SlaSnapshotRow[];
  branchLookup: Map<string, string>;
  jobLookup: Map<string, JobLookupRow>;
  incidentLookup: Map<string, IncidentLookupRow>;
  periodEnd: Date;
}) {
  return input.snapshots.flatMap((snapshot) => {
    if (snapshot.entity_type === 'job') {
      const job = input.jobLookup.get(snapshot.entity_id);
      if (!job) {
        return [];
      }

      return [
        buildEvaluationRow({
          snapshot,
          itemReference: job.reference,
          itemTitle: job.title,
          itemType: 'job',
          branchName: input.branchLookup.get(snapshot.location_id) ?? 'Unknown branch',
          priorityLabel: formatTokenLabel(job.priority),
          severityLabel: null,
          periodEnd: input.periodEnd,
        }),
      ];
    }

    const incident = input.incidentLookup.get(snapshot.entity_id);
    if (!incident) {
      return [];
    }

    return [
      buildEvaluationRow({
        snapshot,
        itemReference: incident.reference,
        itemTitle: incident.title,
        itemType: 'incident',
        branchName: input.branchLookup.get(snapshot.location_id) ?? 'Unknown branch',
        priorityLabel: null,
        severityLabel: formatTokenLabel(incident.severity),
        periodEnd: input.periodEnd,
      }),
    ];
  });
}

function buildEvaluationRow(input: {
  snapshot: SlaSnapshotRow;
  itemReference: string;
  itemTitle: string;
  itemType: 'job' | 'incident';
  branchName: string;
  priorityLabel: string | null;
  severityLabel: string | null;
  periodEnd: Date;
}): AnalyticsSlaEvaluationRow & AnalyticsSlaTableRow {
  const createdAt = new Date(input.snapshot.created_at);
  const firstResponseMinutes = input.snapshot.first_responded_at
    ? (new Date(input.snapshot.first_responded_at).getTime() - createdAt.getTime()) / 60000
    : null;
  const resolutionMinutes = input.snapshot.resolved_at
    ? (new Date(input.snapshot.resolved_at).getTime() - createdAt.getTime()) / 60000
    : null;

  const firstResponseOnTime = resolveOnTimeState({
    eligible: input.snapshot.first_response_target_minutes !== null,
    completedAt: input.snapshot.first_responded_at,
    breachedAt: input.snapshot.first_response_breached_at,
    dueAt: input.snapshot.first_response_due_at,
    periodEnd: input.periodEnd,
  });
  const resolutionOnTime = resolveOnTimeState({
    eligible: input.snapshot.resolution_target_minutes !== null,
    completedAt: input.snapshot.resolved_at,
    breachedAt: input.snapshot.resolution_breached_at,
    dueAt: input.snapshot.resolution_due_at,
    periodEnd: input.periodEnd,
  });

  return {
    itemId: input.snapshot.entity_id,
    itemReference: input.itemReference,
    itemTitle: input.itemTitle,
    itemType: input.itemType,
    branchId: input.snapshot.location_id,
    branchName: input.branchName,
    priorityLabel: input.priorityLabel,
    severityLabel: input.severityLabel,
    createdAtValue: input.snapshot.created_at,
    createdAtLabel: formatDateTimeLabel(input.snapshot.created_at),
    firstResponseMinutes,
    resolutionMinutes,
    firstResponseOnTime,
    resolutionOnTime,
    firstResponseBreached: firstResponseOnTime === false,
    resolutionBreached: resolutionOnTime === false,
  };
}

function resolveOnTimeState(input: {
  eligible: boolean;
  completedAt: string | null;
  breachedAt: string | null;
  dueAt: string | null;
  periodEnd: Date;
}) {
  if (!input.eligible) {
    return null;
  }

  if (input.completedAt && !input.breachedAt) {
    return true;
  }

  if (input.breachedAt) {
    return false;
  }

  if (!input.completedAt && input.dueAt) {
    return new Date(input.dueAt).getTime() > input.periodEnd.getTime();
  }

  return false;
}

function buildTableRows(
  rows: (AnalyticsSlaEvaluationRow & AnalyticsSlaTableRow)[],
): AnalyticsSlaTableRow[] {
  return [...rows].sort((left, right) => {
    const leftResolutionRank = left.resolutionOnTime === false ? 0 : left.resolutionOnTime === true ? 1 : 2;
    const rightResolutionRank =
      right.resolutionOnTime === false ? 0 : right.resolutionOnTime === true ? 1 : 2;

    if (leftResolutionRank !== rightResolutionRank) {
      return leftResolutionRank - rightResolutionRank;
    }

    const leftResponseRank = left.firstResponseOnTime === false ? 0 : left.firstResponseOnTime === true ? 1 : 2;
    const rightResponseRank =
      right.firstResponseOnTime === false ? 0 : right.firstResponseOnTime === true ? 1 : 2;

    if (leftResponseRank !== rightResponseRank) {
      return leftResponseRank - rightResponseRank;
    }

    const responseDelta =
      (right.firstResponseMinutes ?? -1) - (left.firstResponseMinutes ?? -1);
    if (responseDelta !== 0) {
      return responseDelta;
    }

    return left.itemReference.localeCompare(right.itemReference);
  });
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
