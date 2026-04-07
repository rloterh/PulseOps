import type {
  AnalyticsSlaBreakdownRow,
  AnalyticsSlaSummary,
} from '@/features/analytics/types/analytics.types';

export interface AnalyticsSlaEvaluationRow {
  itemId: string;
  branchId: string;
  branchName: string;
  priorityLabel: string | null;
  severityLabel: string | null;
  firstResponseMinutes: number | null;
  resolutionMinutes: number | null;
  firstResponseOnTime: boolean | null;
  resolutionOnTime: boolean | null;
  firstResponseBreached: boolean;
  resolutionBreached: boolean;
}

export function buildSlaSummary(
  rows: AnalyticsSlaEvaluationRow[],
): AnalyticsSlaSummary {
  const firstResponseEligible = rows.filter(
    (row) => row.firstResponseOnTime !== null,
  );
  const resolutionEligible = rows.filter((row) => row.resolutionOnTime !== null);

  const firstResponseOnTime = firstResponseEligible.filter(
    (row) => row.firstResponseOnTime === true,
  ).length;
  const resolutionOnTime = resolutionEligible.filter(
    (row) => row.resolutionOnTime === true,
  ).length;

  return {
    totalEvaluated: rows.length,
    firstResponseOnTime,
    firstResponseBreached: firstResponseEligible.length - firstResponseOnTime,
    firstResponseRate:
      firstResponseEligible.length > 0
        ? (firstResponseOnTime / firstResponseEligible.length) * 100
        : null,
    resolutionOnTime,
    resolutionBreached: resolutionEligible.length - resolutionOnTime,
    resolutionRate:
      resolutionEligible.length > 0
        ? (resolutionOnTime / resolutionEligible.length) * 100
        : null,
    medianFirstResponseMinutes: calculatePercentile(
      firstResponseEligible
        .map((row) => row.firstResponseMinutes)
        .filter((value): value is number => value !== null),
      0.5,
    ),
    p95FirstResponseMinutes: calculatePercentile(
      firstResponseEligible
        .map((row) => row.firstResponseMinutes)
        .filter((value): value is number => value !== null),
      0.95,
    ),
    medianResolutionMinutes: calculatePercentile(
      resolutionEligible
        .map((row) => row.resolutionMinutes)
        .filter((value): value is number => value !== null),
      0.5,
    ),
    p95ResolutionMinutes: calculatePercentile(
      resolutionEligible
        .map((row) => row.resolutionMinutes)
        .filter((value): value is number => value !== null),
      0.95,
    ),
  };
}

export function buildSlaBreakdown(
  rows: AnalyticsSlaEvaluationRow[],
  key: 'branch' | 'priority' | 'severity',
): AnalyticsSlaBreakdownRow[] {
  const buckets = new Map<string, AnalyticsSlaEvaluationRow[]>();

  for (const row of rows) {
    const label =
      key === 'branch'
        ? row.branchName
        : key === 'priority'
          ? row.priorityLabel
          : row.severityLabel;

    if (!label) {
      continue;
    }

    const current = buckets.get(label) ?? [];
    current.push(row);
    buckets.set(label, current);
  }

  return Array.from(buckets.entries())
    .map(([label, bucketRows]) => {
      const summary = buildSlaSummary(bucketRows);

      return {
        label,
        totalEvaluated: bucketRows.length,
        firstResponseRate: summary.firstResponseRate,
        resolutionRate: summary.resolutionRate,
        breachCount: bucketRows.filter(
          (row) => row.firstResponseBreached || row.resolutionBreached,
        ).length,
      } satisfies AnalyticsSlaBreakdownRow;
    })
    .sort((left, right) => {
      return (
        right.totalEvaluated - left.totalEvaluated ||
        right.breachCount - left.breachCount ||
        left.label.localeCompare(right.label)
      );
    });
}

function calculatePercentile(values: number[], percentile: number) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(percentile * sorted.length) - 1),
  );
  const value = sorted[index];
  return value ?? null;
}
