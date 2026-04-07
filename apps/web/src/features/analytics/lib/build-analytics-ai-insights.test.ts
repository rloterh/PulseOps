import { describe, expect, it } from 'vitest';
import { buildAnalyticsAiInsights } from '@/features/analytics/lib/build-analytics-ai-insights';

describe('buildAnalyticsAiInsights', () => {
  it('prioritizes critical branches and high-risk late jobs', () => {
    const result = buildAnalyticsAiInsights({
      branches: [
        { id: 'branch-a', name: 'North Branch' },
        { id: 'branch-b', name: 'South Branch' },
      ],
      jobsCreatedCount: 12,
      jobsResolvedCount: 8,
      backlogCount: 5,
      incidentsOpened: [
        { id: 'incident-1', locationId: 'branch-a' },
        { id: 'incident-2', locationId: 'branch-a' },
      ],
      activeJobs: [
        {
          id: 'job-1',
          reference: 'JOB-001',
          title: 'Restore HVAC controller',
          status: 'blocked',
          priority: 'urgent',
          dueAt: '2026-04-08T08:00:00.000Z',
          locationId: 'branch-a',
        },
        {
          id: 'job-2',
          reference: 'JOB-002',
          title: 'Inspect rooftop unit',
          status: 'scheduled',
          priority: 'medium',
          dueAt: '2026-04-10T10:00:00.000Z',
          locationId: 'branch-b',
        },
      ],
      slaSnapshots: [
        {
          entityId: 'job-1',
          entityType: 'job',
          locationId: 'branch-a',
          riskLevel: 'breached',
          escalationState: 'escalated',
          firstResponseDueAt: '2026-04-08T06:00:00.000Z',
          resolutionDueAt: '2026-04-08T07:00:00.000Z',
          firstResponseBreachedAt: '2026-04-08T06:05:00.000Z',
          resolutionBreachedAt: '2026-04-08T07:05:00.000Z',
        },
      ],
      now: new Date('2026-04-08T09:00:00.000Z'),
    });

    expect(result.executiveSummary.headline).toContain('North Branch');
    expect(result.branchSummaryCards[0]).toMatchObject({
      branchName: 'North Branch',
      statusTone: 'critical',
      overdueCount: 1,
    });
    expect(result.lateJobRiskSignals[0]).toMatchObject({
      reference: 'JOB-001',
      statusTone: 'critical',
    });
    expect(result.lateJobRiskSignals[0]?.reasons).toContain(
      'Job is blocked and cannot move forward without intervention.',
    );
  });

  it('returns calmer guidance when no critical signals exist', () => {
    const result = buildAnalyticsAiInsights({
      branches: [{ id: 'branch-a', name: 'North Branch' }],
      jobsCreatedCount: 3,
      jobsResolvedCount: 3,
      backlogCount: 0,
      incidentsOpened: [],
      activeJobs: [],
      slaSnapshots: [],
      now: new Date('2026-04-08T09:00:00.000Z'),
    });

    expect(result.executiveSummary.headline).toContain('steady');
    expect(result.lateJobRiskSignals).toHaveLength(0);
    expect(result.executiveSummary.confidenceLabel).toBe('Early signal');
  });
});
