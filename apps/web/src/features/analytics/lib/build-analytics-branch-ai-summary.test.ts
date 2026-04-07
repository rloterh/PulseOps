import { describe, expect, it } from 'vitest';
import { buildAnalyticsBranchAiSummary } from '@/features/analytics/lib/build-analytics-branch-ai-summary';

describe('buildAnalyticsBranchAiSummary', () => {
  it('identifies strongest and highest-risk branches from comparison rows', () => {
    const result = buildAnalyticsBranchAiSummary([
      {
        branchId: 'north',
        branchName: 'North Branch',
        jobsCreated: 10,
        jobsResolved: 8,
        openBacklog: 3,
        backlogDelta: -1,
        incidentCount: 1,
        medianResolutionMinutes: 180,
        firstResponseSlaRate: 93,
        resolutionSlaRate: 88,
        breachCount: 1,
      },
      {
        branchId: 'south',
        branchName: 'South Branch',
        jobsCreated: 7,
        jobsResolved: 4,
        openBacklog: 6,
        backlogDelta: 2,
        incidentCount: 2,
        medianResolutionMinutes: 360,
        firstResponseSlaRate: 71,
        resolutionSlaRate: 62,
        breachCount: 3,
      },
    ]);

    expect(result.headline).toContain('North Branch');
    expect(result.headline).toContain('South Branch');
    expect(result.strongestBranchName).toBe('North Branch');
    expect(result.mostAtRiskBranchName).toBe('South Branch');
    expect(result.keyDrivers.length).toBeGreaterThan(1);
    expect(result.supportingFacts).toContainEqual({
      label: 'Combined breaches',
      value: '4',
    });
  });

  it('returns a safe empty-state summary when there are no rows', () => {
    const result = buildAnalyticsBranchAiSummary([]);

    expect(result.headline).toContain('Not enough');
    expect(result.strongestBranchName).toBeNull();
    expect(result.keyDrivers).toHaveLength(0);
  });
});

