import { describe, expect, it } from 'vitest';
import {
  buildSlaBreakdown,
  buildSlaSummary,
  type AnalyticsSlaEvaluationRow,
} from '@/features/analytics/lib/build-sla-metrics';

const baseRows: AnalyticsSlaEvaluationRow[] = [
  {
    itemId: 'job-1',
    branchId: 'branch-a',
    branchName: 'North Branch',
    priorityLabel: 'urgent',
    severityLabel: null,
    firstResponseMinutes: 12,
    resolutionMinutes: 50,
    firstResponseOnTime: true,
    resolutionOnTime: true,
    firstResponseBreached: false,
    resolutionBreached: false,
  },
  {
    itemId: 'job-2',
    branchId: 'branch-a',
    branchName: 'North Branch',
    priorityLabel: 'high',
    severityLabel: null,
    firstResponseMinutes: 42,
    resolutionMinutes: 185,
    firstResponseOnTime: false,
    resolutionOnTime: false,
    firstResponseBreached: true,
    resolutionBreached: true,
  },
  {
    itemId: 'incident-1',
    branchId: 'branch-b',
    branchName: 'South Branch',
    priorityLabel: null,
    severityLabel: 'critical',
    firstResponseMinutes: 7,
    resolutionMinutes: 95,
    firstResponseOnTime: true,
    resolutionOnTime: false,
    firstResponseBreached: false,
    resolutionBreached: true,
  },
];

describe('buildSlaSummary', () => {
  it('calculates rates and percentile timings', () => {
    const summary = buildSlaSummary(baseRows);

    expect(summary.totalEvaluated).toBe(3);
    expect(summary.firstResponseOnTime).toBe(2);
    expect(summary.firstResponseBreached).toBe(1);
    expect(summary.firstResponseRate).toBeCloseTo(66.67, 1);
    expect(summary.resolutionOnTime).toBe(1);
    expect(summary.resolutionBreached).toBe(2);
    expect(summary.medianFirstResponseMinutes).toBe(12);
    expect(summary.p95ResolutionMinutes).toBe(185);
  });
});

describe('buildSlaBreakdown', () => {
  it('groups by branch and sorts by evaluated volume', () => {
    const rows = buildSlaBreakdown(baseRows, 'branch');

    expect(rows[0]).toMatchObject({
      label: 'North Branch',
      totalEvaluated: 2,
      breachCount: 1,
    });
    expect(rows[1]).toMatchObject({
      label: 'South Branch',
      totalEvaluated: 1,
      breachCount: 1,
    });
  });

  it('ignores missing labels when grouping by priority or severity', () => {
    expect(buildSlaBreakdown(baseRows, 'priority')).toHaveLength(2);
    expect(buildSlaBreakdown(baseRows, 'severity')).toHaveLength(1);
  });
});
