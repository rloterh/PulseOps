import type {
  AnalyticsBranchComparisonData,
  AnalyticsSlaMetricsData,
} from '@/features/analytics/types/analytics.types';
import { serializeAnalyticsCsv } from '@/features/analytics/lib/serialize-analytics-csv';

export function buildBranchComparisonCsv(data: AnalyticsBranchComparisonData) {
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

export function buildSlaMetricsCsv(data: AnalyticsSlaMetricsData) {
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
      created_at: row.createdAtValue,
      first_response_minutes: row.firstResponseMinutes,
      first_response_on_time: row.firstResponseOnTime,
      resolution_minutes: row.resolutionMinutes,
      resolution_on_time: row.resolutionOnTime,
    })),
  });
}
