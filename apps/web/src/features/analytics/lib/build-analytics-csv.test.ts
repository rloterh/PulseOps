import { describe, expect, it } from 'vitest';
import {
  buildBranchComparisonCsv,
  buildSlaMetricsCsv,
} from '@/features/analytics/lib/build-analytics-csv';

describe('buildBranchComparisonCsv', () => {
  it('serializes branch comparison rows in the expected column order', () => {
    const csv = buildBranchComparisonCsv({
      filters: {
        preset: '30d',
        from: null,
        to: null,
        branchId: null,
        compare: true,
      },
      rangeLabel: 'Apr 1 - Apr 30, 2026',
      compareLabel: 'Mar 2 - Mar 31, 2026',
      scopeLabel: 'All branch comparison',
      rankings: {
        resolvedVolume: [],
        firstResponseSla: [],
        breachCount: [],
      },
      rows: [
        {
          branchId: 'branch-1',
          branchName: 'North',
          jobsCreated: 10,
          jobsResolved: 8,
          openBacklog: 5,
          backlogDelta: -2,
          incidentCount: 3,
          medianResolutionMinutes: 91,
          firstResponseSlaRate: 97.5,
          resolutionSlaRate: 92.1,
          breachCount: 1,
        },
      ],
    });

    expect(csv).toBe(
      'branch_name,jobs_created,jobs_resolved,open_backlog,backlog_delta,incident_count,median_resolution_minutes,first_response_sla_rate,resolution_sla_rate,breach_count\nNorth,10,8,5,-2,3,91,97.5,92.1,1\n',
    );
  });
});

describe('buildSlaMetricsCsv', () => {
  it('uses stable raw timestamps instead of UI-formatted labels', () => {
    const csv = buildSlaMetricsCsv({
      filters: {
        preset: '30d',
        from: null,
        to: null,
        branchId: null,
        compare: true,
      },
      rangeLabel: 'Apr 1 - Apr 30, 2026',
      compareLabel: null,
      scopeLabel: 'All branches SLA scope',
      summary: {
        totalEvaluated: 1,
        firstResponseOnTime: 1,
        firstResponseBreached: 0,
        firstResponseRate: 100,
        resolutionOnTime: 1,
        resolutionBreached: 0,
        resolutionRate: 100,
        medianFirstResponseMinutes: 12,
        p95FirstResponseMinutes: 12,
        medianResolutionMinutes: 58,
        p95ResolutionMinutes: 58,
      },
      breakdowns: {
        byBranch: [],
        byPriority: [],
        bySeverity: [],
      },
      table: [
        {
          itemId: 'job-1',
          itemReference: 'JOB-001',
          itemTitle: 'Replace pump',
          itemType: 'job',
          branchName: 'North',
          priorityLabel: 'High',
          severityLabel: null,
          createdAtValue: '2026-04-07T08:30:00.000Z',
          createdAtLabel: '7 Apr 2026, 09:30',
          firstResponseMinutes: 12,
          resolutionMinutes: 58,
          firstResponseOnTime: true,
          resolutionOnTime: true,
        },
      ],
    });

    expect(csv).toContain('2026-04-07T08:30:00.000Z');
    expect(csv).not.toContain('7 Apr 2026, 09:30');
  });
});
