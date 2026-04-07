import type {
  AnalyticsAiInsights,
  AnalyticsBranchSummaryCard,
  AnalyticsExecutiveSummary,
  AnalyticsLateJobRiskSignal,
} from '@/features/analytics/types/analytics.types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';

interface InsightBranch {
  id: string;
  name: string;
}

interface InsightJob {
  id: string;
  reference: string;
  title: string;
  status: string;
  priority: string;
  dueAt: string | null;
  locationId: string;
}

interface InsightIncident {
  id: string;
  locationId: string;
}

interface InsightSlaSnapshot {
  entityId: string;
  entityType: 'job' | 'incident';
  locationId: string;
  riskLevel: 'normal' | 'at_risk' | 'breached';
  escalationState: 'none' | 'warning' | 'escalated';
  firstResponseDueAt: string | null;
  resolutionDueAt: string | null;
  firstResponseBreachedAt: string | null;
  resolutionBreachedAt: string | null;
}

interface BuildInput {
  branches: InsightBranch[];
  jobsCreatedCount: number;
  jobsResolvedCount: number;
  backlogCount: number;
  incidentsOpened: InsightIncident[];
  activeJobs: InsightJob[];
  slaSnapshots: InsightSlaSnapshot[];
  now?: Date;
}

const PRIORITY_SCORE: Record<string, number> = {
  urgent: 24,
  high: 16,
  medium: 8,
  low: 2,
};

export function buildAnalyticsAiInsights(input: BuildInput): AnalyticsAiInsights {
  const now = input.now ?? new Date();
  const branchCards = buildBranchSummaryCards(input, now);
  const lateJobRiskSignals = buildLateJobRiskSignals(input, now);

  return {
    executiveSummary: buildExecutiveSummary(input, branchCards, lateJobRiskSignals),
    branchSummaryCards: branchCards,
    lateJobRiskSignals,
  };
}

function buildExecutiveSummary(
  input: BuildInput,
  branchCards: AnalyticsBranchSummaryCard[],
  lateJobRiskSignals: AnalyticsLateJobRiskSignal[],
): AnalyticsExecutiveSummary {
  const hottestBranch = branchCards[0] ?? null;
  const criticalSignals = lateJobRiskSignals.filter((signal) => signal.statusTone === 'critical');
  const breachCount = input.slaSnapshots.filter(
    (snapshot) => snapshot.riskLevel === 'breached',
  ).length;
  const completionRate =
    input.jobsCreatedCount > 0
      ? Math.round((input.jobsResolvedCount / input.jobsCreatedCount) * 100)
      : null;
  const confidenceLabel =
    input.jobsCreatedCount + input.incidentsOpened.length >= 15
      ? 'High confidence'
      : input.jobsCreatedCount + input.incidentsOpened.length >= 6
        ? 'Moderate confidence'
        : 'Early signal';

  const headline = hottestBranch
    ? hottestBranch.statusTone === 'critical'
      ? `${hottestBranch.branchName} needs immediate dispatch attention.`
      : hottestBranch.statusTone === 'watch'
        ? `${hottestBranch.branchName} is showing early workload strain.`
        : 'Operations look steady across the selected scope.'
    : input.backlogCount === 0 && input.incidentsOpened.length === 0
      ? 'Operations look steady across the selected scope.'
      : 'Not enough branch activity to generate an executive summary yet.';

  const narrative = [
    input.backlogCount > 0
      ? `${String(input.backlogCount)} active jobs remain open across the selected scope`
      : 'No active job backlog is currently building',
    completionRate !== null
      ? `with ${String(completionRate)}% of created jobs resolved inside the reporting window`
      : 'with too little closed-job volume to judge throughput cleanly',
    breachCount > 0
      ? `and ${String(breachCount)} SLA snapshot${breachCount === 1 ? '' : 's'} already in breach`
      : 'and no current SLA breaches detected in the sampled records',
  ]
    .join(' ')
    .concat('.');

  const highlights = [
    hottestBranch
      ? `${hottestBranch.branchName} has ${String(hottestBranch.backlogCount)} active jobs, including ${String(hottestBranch.overdueCount)} overdue item${hottestBranch.overdueCount === 1 ? '' : 's'}.`
      : 'Branch-level summary cards will appear once operational volume is present.',
    criticalSignals.length > 0
      ? `${String(criticalSignals.length)} late-job risk signal${criticalSignals.length === 1 ? '' : 's'} need same-day review.`
      : 'No critical late-job risk signals are active right now.',
    input.incidentsOpened.length > 0
      ? `${String(input.incidentsOpened.length)} incident${input.incidentsOpened.length === 1 ? '' : 's'} opened during the reporting window, which should inform staffing posture.`
      : 'Incident volume is quiet in this reporting window.',
  ];

  const nextSteps = [
    criticalSignals[0]
      ? `Triage ${criticalSignals[0].reference} first because it is the highest-risk late job in the current view.`
      : 'Keep monitoring high-priority jobs for new due-date pressure.',
    hottestBranch && hottestBranch.overdueCount > 0
      ? `Rebalance dispatch load in ${hottestBranch.branchName} to reduce overdue backlog before the next shift change.`
      : 'Use branch cards to confirm where capacity can absorb more work.',
    breachCount > 0
      ? 'Review breached SLA records alongside escalation workflows to prevent repeated misses.'
      : 'Maintain current response discipline so emerging SLA risk does not become breach debt.',
  ];

  return {
    headline,
    narrative,
    confidenceLabel,
    highlights,
    nextSteps,
  };
}

function buildBranchSummaryCards(input: BuildInput, now: Date): AnalyticsBranchSummaryCard[] {
  const locationNames = new Map(input.branches.map((branch) => [branch.id, branch.name]));

  return input.branches
    .map((branch) => {
      const branchJobs = input.activeJobs.filter((job) => job.locationId === branch.id);
      const branchIncidents = input.incidentsOpened.filter(
        (incident) => incident.locationId === branch.id,
      );
      const branchSnapshots = input.slaSnapshots.filter(
        (snapshot) => snapshot.locationId === branch.id,
      );
      const overdueCount = branchJobs.filter((job) => isOverdue(job.dueAt, now)).length;
      const breachCount = branchSnapshots.filter(
        (snapshot) => snapshot.riskLevel === 'breached',
      ).length;
      const watchCount = branchSnapshots.filter(
        (snapshot) => snapshot.riskLevel === 'at_risk',
      ).length;
      const statusTone =
        overdueCount >= 2 ||
        breachCount >= 2 ||
        (overdueCount > 0 && breachCount > 0)
          ? 'critical'
          : overdueCount > 0 || breachCount > 0 || watchCount > 0
            ? 'watch'
            : 'stable';

      return {
        branchId: branch.id,
        branchName: locationNames.get(branch.id) ?? 'Unknown branch',
        backlogCount: branchJobs.length,
        overdueCount,
        incidentCount: branchIncidents.length,
        breachCount,
        recommendation: buildBranchRecommendation({
          overdueCount,
          backlogCount: branchJobs.length,
          incidentCount: branchIncidents.length,
          breachCount,
          watchCount,
        }),
        statusTone,
      } satisfies AnalyticsBranchSummaryCard;
    })
    .filter((card) => card.backlogCount > 0 || card.incidentCount > 0 || card.breachCount > 0)
    .sort((left, right) => {
      const toneScore = scoreBranchTone(right.statusTone) - scoreBranchTone(left.statusTone);
      if (toneScore !== 0) {
        return toneScore;
      }

      return (
        right.overdueCount - left.overdueCount ||
        right.breachCount - left.breachCount ||
        right.backlogCount - left.backlogCount ||
        left.branchName.localeCompare(right.branchName)
      );
    });
}

function buildLateJobRiskSignals(
  input: BuildInput,
  now: Date,
): AnalyticsLateJobRiskSignal[] {
  const locationNames = new Map(input.branches.map((branch) => [branch.id, branch.name]));
  const slaByJobId = new Map(
    input.slaSnapshots
      .filter((snapshot) => snapshot.entityType === 'job')
      .map((snapshot) => [snapshot.entityId, snapshot]),
  );

  return input.activeJobs
    .map((job) => {
      const snapshot = slaByJobId.get(job.id) ?? null;
      const reasons = buildLateJobReasons(job, snapshot, now);
      const score = buildLateJobScore(job, snapshot, now);

      if (score < 18 || reasons.length === 0) {
        return null;
      }

      const statusTone = score >= 45 ? 'critical' : 'watch';

      return {
        jobId: job.id,
        reference: job.reference,
        title: job.title,
        branchName: locationNames.get(job.locationId) ?? 'Unknown branch',
        statusLabel: formatTokenLabel(job.status),
        priorityLabel: formatTokenLabel(job.priority),
        dueAtLabel: formatDateTimeLabel(job.dueAt),
        score,
        statusTone,
        reasons,
        recommendation: buildLateJobRecommendation(job, snapshot, now),
      } satisfies AnalyticsLateJobRiskSignal;
    })
    .filter((signal): signal is AnalyticsLateJobRiskSignal => signal !== null)
    .sort((left, right) => right.score - left.score || left.reference.localeCompare(right.reference))
    .slice(0, 6);
}

function buildBranchRecommendation(input: {
  overdueCount: number;
  backlogCount: number;
  incidentCount: number;
  breachCount: number;
  watchCount: number;
}) {
  if (input.overdueCount >= 2 || input.breachCount >= 2) {
    return 'Shift dispatch capacity here first and clear overdue work before adding fresh intake.';
  }

  if (input.overdueCount > 0 || input.watchCount > 0) {
    return 'Watch this branch closely and tighten owner follow-through on active jobs today.';
  }

  if (input.backlogCount >= 4 || input.incidentCount >= 2) {
    return 'Healthy but busy. Keep throughput high so this branch does not slip into backlog pressure.';
  }

  return 'Stable operating lane. This branch can absorb incremental work if another site needs relief.';
}

function buildLateJobReasons(
  job: InsightJob,
  snapshot: InsightSlaSnapshot | null,
  now: Date,
) {
  const reasons: string[] = [];

  if (isOverdue(job.dueAt, now)) {
    reasons.push('Due time is already in the past.');
  } else if (isDueSoon(job.dueAt, now)) {
    reasons.push('Due time lands within the next 24 hours.');
  }

  if (job.status === 'blocked') {
    reasons.push('Job is blocked and cannot move forward without intervention.');
  }

  if (job.priority === 'urgent' || job.priority === 'high') {
    reasons.push(`${formatTokenLabel(job.priority)} priority makes delay more expensive.`);
  }

  if (snapshot?.riskLevel === 'breached') {
    reasons.push('SLA snapshot is already marked as breached.');
  } else if (snapshot?.riskLevel === 'at_risk') {
    reasons.push('SLA snapshot is already trending at risk.');
  }

  if (snapshot?.escalationState === 'escalated') {
    reasons.push('SLA escalation has already been triggered for this job.');
  } else if (snapshot?.escalationState === 'warning') {
    reasons.push('SLA warning has already been issued for this job.');
  }

  return reasons;
}

function buildLateJobScore(
  job: InsightJob,
  snapshot: InsightSlaSnapshot | null,
  now: Date,
) {
  let score = PRIORITY_SCORE[job.priority] ?? 0;

  if (isOverdue(job.dueAt, now)) {
    score += 28;
  } else if (isDueSoon(job.dueAt, now)) {
    score += 12;
  }

  if (job.status === 'blocked') {
    score += 18;
  } else if (job.status === 'in_progress') {
    score += 6;
  }

  if (snapshot?.riskLevel === 'breached') {
    score += 26;
  } else if (snapshot?.riskLevel === 'at_risk') {
    score += 12;
  }

  if (snapshot?.escalationState === 'escalated') {
    score += 16;
  } else if (snapshot?.escalationState === 'warning') {
    score += 8;
  }

  return score;
}

function buildLateJobRecommendation(
  job: InsightJob,
  snapshot: InsightSlaSnapshot | null,
  now: Date,
) {
  if (job.status === 'blocked') {
    return 'Remove the blocker or reassign ownership before this job stalls another cycle.';
  }

  if (snapshot?.riskLevel === 'breached' || isOverdue(job.dueAt, now)) {
    return 'Pull this job into the next dispatch review and confirm a same-day recovery plan.';
  }

  if (snapshot?.riskLevel === 'at_risk' || isDueSoon(job.dueAt, now)) {
    return 'Confirm assignee progress and tighten the due-date plan before this slips late.';
  }

  return 'Monitor closely and keep this job visible in the next branch stand-up.';
}

function scoreBranchTone(value: AnalyticsBranchSummaryCard['statusTone']) {
  if (value === 'critical') {
    return 3;
  }

  if (value === 'watch') {
    return 2;
  }

  return 1;
}

function isOverdue(value: string | null, now: Date) {
  return value !== null && new Date(value).getTime() <= now.getTime();
}

function isDueSoon(value: string | null, now: Date) {
  if (value === null) {
    return false;
  }

  const diff = new Date(value).getTime() - now.getTime();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}
