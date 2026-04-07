import type {
  AnalyticsBranchComparisonRow,
  AnalyticsBranchComparisonSummary,
  AnalyticsSupportingFact,
} from '@/features/analytics/types/analytics.types';
import {
  formatMetricMinutes,
  formatMetricNumber,
  formatMetricPercent,
} from '@/features/analytics/lib/metric-formatters';

export function buildAnalyticsBranchAiSummary(
  rows: AnalyticsBranchComparisonRow[],
): AnalyticsBranchComparisonSummary {
  const strongestBranch = [...rows].sort(compareStrongestBranch)[0] ?? null;
  const mostAtRiskBranch = [...rows].sort(compareRiskiestBranch)[0] ?? null;
  const totalBreaches = rows.reduce((sum, row) => sum + row.breachCount, 0);
  const totalBacklog = rows.reduce((sum, row) => sum + row.openBacklog, 0);
  const avgFirstResponseRate =
    rows.length > 0
      ? average(rows.map((row) => row.firstResponseSlaRate).filter(isNumber))
      : null;

  const headline = strongestBranch
    ? mostAtRiskBranch && strongestBranch.branchId !== mostAtRiskBranch.branchId
      ? `${strongestBranch.branchName} is leading throughput while ${mostAtRiskBranch.branchName} carries the sharpest risk.`
      : `${strongestBranch.branchName} is setting the current branch pace.`
    : 'Not enough branch comparison data is available yet.';

  const narrative = strongestBranch
    ? [
        `${strongestBranch.branchName} resolved ${String(strongestBranch.jobsResolved)} jobs in the current window`,
        strongestBranch.firstResponseSlaRate !== null
          ? `with ${formatMetricPercent(strongestBranch.firstResponseSlaRate)} first-response SLA attainment`
          : 'with limited first-response SLA data',
        mostAtRiskBranch
          ? `while ${mostAtRiskBranch.branchName} is carrying ${String(mostAtRiskBranch.openBacklog)} active backlog and ${String(mostAtRiskBranch.breachCount)} breached snapshot${mostAtRiskBranch.breachCount === 1 ? '' : 's'}`
          : 'while no branch is currently separating itself as a clear risk pocket',
      ]
        .join(' ')
        .concat('.')
    : 'Branch comparison needs a wider reporting window before PulseOps can generate a useful narrative.';

  const keyDrivers: string[] = [];
  if (strongestBranch) {
    keyDrivers.push(
      `${strongestBranch.branchName} leads resolved volume at ${String(strongestBranch.jobsResolved)} completed jobs.`,
    );
  }
  if (mostAtRiskBranch && (mostAtRiskBranch.breachCount > 0 || mostAtRiskBranch.openBacklog > 0)) {
    keyDrivers.push(
      `${mostAtRiskBranch.branchName} is carrying ${String(mostAtRiskBranch.openBacklog)} open jobs and ${String(mostAtRiskBranch.breachCount)} current breaches.`,
    );
  }
  if (avgFirstResponseRate !== null) {
    keyDrivers.push(
      `Average branch first-response SLA attainment is ${formatMetricPercent(avgFirstResponseRate)} across the selected scope.`,
    );
  }
  if (totalBreaches > 0) {
    keyDrivers.push(
      `${String(totalBreaches)} breached SLA snapshot${totalBreaches === 1 ? '' : 's'} are concentrated across the branch comparison view.`,
    );
  }

  const nextSteps = [
    mostAtRiskBranch
      ? `Review ${mostAtRiskBranch.branchName} first for backlog relief, escalations, and overdue-response cleanup.`
      : 'Keep reviewing branch comparison trends to catch new operational imbalance early.',
    strongestBranch && strongestBranch.branchId !== mostAtRiskBranch?.branchId
      ? `Use ${strongestBranch.branchName} as the current operating benchmark when coaching slower branches.`
      : 'Use the current branch leaders to document repeatable operating patterns.',
    totalBreaches > 0
      ? 'Pair branch comparison with the SLA view so breach pockets are reviewed with the underlying records.'
      : 'Keep SLA discipline high so branch comparisons stay focused on throughput rather than recovery.',
  ];

  return {
    headline,
    narrative,
    strongestBranchName: strongestBranch?.branchName ?? null,
    mostAtRiskBranchName: mostAtRiskBranch?.branchName ?? null,
    keyDrivers,
    nextSteps,
    supportingFacts: buildSupportingFacts({
      strongestBranch,
      mostAtRiskBranch,
      totalBreaches,
      totalBacklog,
      avgFirstResponseRate,
      rows: rows.length,
    }),
  };
}

function buildSupportingFacts(input: {
  strongestBranch: AnalyticsBranchComparisonRow | null;
  mostAtRiskBranch: AnalyticsBranchComparisonRow | null;
  totalBreaches: number;
  totalBacklog: number;
  avgFirstResponseRate: number | null;
  rows: number;
}): AnalyticsSupportingFact[] {
  return [
    {
      label: 'Branches compared',
      value: formatMetricNumber(input.rows),
    },
    {
      label: 'Strongest branch',
      value: input.strongestBranch?.branchName ?? 'Not enough data',
    },
    {
      label: 'Highest-risk branch',
      value: input.mostAtRiskBranch?.branchName ?? 'No clear risk pocket',
    },
    {
      label: 'Combined backlog',
      value: formatMetricNumber(input.totalBacklog),
    },
    {
      label: 'Combined breaches',
      value: formatMetricNumber(input.totalBreaches),
    },
    {
      label: 'Average first-response SLA',
      value:
        input.avgFirstResponseRate === null
          ? 'N/A'
          : formatMetricPercent(input.avgFirstResponseRate),
    },
    {
      label: 'Strongest median resolution',
      value: input.strongestBranch
        ? formatMetricMinutes(input.strongestBranch.medianResolutionMinutes)
        : 'N/A',
    },
  ];
}

function compareStrongestBranch(
  left: AnalyticsBranchComparisonRow,
  right: AnalyticsBranchComparisonRow,
) {
  return (
    right.jobsResolved - left.jobsResolved ||
    (right.firstResponseSlaRate ?? -1) - (left.firstResponseSlaRate ?? -1) ||
    left.openBacklog - right.openBacklog ||
    left.branchName.localeCompare(right.branchName)
  );
}

function compareRiskiestBranch(
  left: AnalyticsBranchComparisonRow,
  right: AnalyticsBranchComparisonRow,
) {
  return (
    right.breachCount - left.breachCount ||
    right.openBacklog - left.openBacklog ||
    right.incidentCount - left.incidentCount ||
    (left.firstResponseSlaRate ?? 101) - (right.firstResponseSlaRate ?? 101) ||
    left.branchName.localeCompare(right.branchName)
  );
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isNumber(value: number | null): value is number {
  return value !== null;
}

