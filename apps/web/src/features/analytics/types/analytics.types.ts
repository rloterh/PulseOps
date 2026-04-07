export interface AnalyticsFilters {
  preset: '7d' | '30d' | '90d' | 'custom';
  from: string | null;
  to: string | null;
  branchId: string | null;
  compare: boolean;
}

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
  label: string;
  compareFrom: Date | null;
  compareTo: Date | null;
}

export interface AnalyticsBranchOption {
  id: string;
  name: string;
}

export interface AnalyticsKpi {
  label: string;
  value: string;
  helperText: string;
  deltaLabel: string;
  deltaDirection: 'up' | 'down' | 'neutral';
}

export interface AnalyticsTrendPoint {
  label: string;
  jobsCreated: number;
  jobsResolved: number;
  incidentsOpened: number;
}

export interface AnalyticsBreakdownRow {
  label: string;
  value: number;
  helperText: string;
}

export interface AnalyticsExecutiveSummary {
  headline: string;
  narrative: string;
  confidenceLabel: string;
  highlights: string[];
  nextSteps: string[];
}

export interface AnalyticsBranchSummaryCard {
  branchId: string;
  branchName: string;
  backlogCount: number;
  overdueCount: number;
  incidentCount: number;
  breachCount: number;
  recommendation: string;
  statusTone: 'stable' | 'watch' | 'critical';
}

export interface AnalyticsLateJobRiskSignal {
  jobId: string;
  reference: string;
  title: string;
  branchName: string;
  statusLabel: string;
  priorityLabel: string;
  dueAtLabel: string;
  score: number;
  statusTone: 'watch' | 'critical';
  reasons: string[];
  recommendation: string;
}

export interface AnalyticsAiInsights {
  executiveSummary: AnalyticsExecutiveSummary;
  branchSummaryCards: AnalyticsBranchSummaryCard[];
  lateJobRiskSignals: AnalyticsLateJobRiskSignal[];
}

export interface AnalyticsOverviewData {
  filters: AnalyticsFilters;
  rangeLabel: string;
  compareLabel: string | null;
  scopeLabel: string;
  kpis: AnalyticsKpi[];
  charts: {
    volumeTrend: AnalyticsTrendPoint[];
    jobsByStatus: AnalyticsBreakdownRow[];
    jobsByPriority: AnalyticsBreakdownRow[];
  };
  ai: AnalyticsAiInsights;
}

export interface AnalyticsBranchComparisonRow {
  branchId: string;
  branchName: string;
  jobsCreated: number;
  jobsResolved: number;
  openBacklog: number;
  backlogDelta: number | null;
  incidentCount: number;
  medianResolutionMinutes: number | null;
  firstResponseSlaRate: number | null;
  resolutionSlaRate: number | null;
  breachCount: number;
}

export interface AnalyticsBranchComparisonData {
  filters: AnalyticsFilters;
  rangeLabel: string;
  compareLabel: string | null;
  scopeLabel: string;
  rows: AnalyticsBranchComparisonRow[];
  rankings: {
    resolvedVolume: AnalyticsBreakdownRow[];
    firstResponseSla: AnalyticsBreakdownRow[];
    breachCount: AnalyticsBreakdownRow[];
  };
}

export interface AnalyticsSlaBreakdownRow {
  label: string;
  totalEvaluated: number;
  firstResponseRate: number | null;
  resolutionRate: number | null;
  breachCount: number;
}

export interface AnalyticsSlaSummary {
  totalEvaluated: number;
  firstResponseOnTime: number;
  firstResponseBreached: number;
  firstResponseRate: number | null;
  resolutionOnTime: number;
  resolutionBreached: number;
  resolutionRate: number | null;
  medianFirstResponseMinutes: number | null;
  p95FirstResponseMinutes: number | null;
  medianResolutionMinutes: number | null;
  p95ResolutionMinutes: number | null;
}

export interface AnalyticsSlaTableRow {
  itemId: string;
  itemReference: string;
  itemTitle: string;
  itemType: 'job' | 'incident';
  branchName: string;
  priorityLabel: string | null;
  severityLabel: string | null;
  createdAtValue: string;
  createdAtLabel: string;
  firstResponseMinutes: number | null;
  resolutionMinutes: number | null;
  firstResponseOnTime: boolean | null;
  resolutionOnTime: boolean | null;
}

export interface AnalyticsSlaMetricsData {
  filters: AnalyticsFilters;
  rangeLabel: string;
  compareLabel: string | null;
  scopeLabel: string;
  summary: AnalyticsSlaSummary;
  breakdowns: {
    byBranch: AnalyticsSlaBreakdownRow[];
    byPriority: AnalyticsSlaBreakdownRow[];
    bySeverity: AnalyticsSlaBreakdownRow[];
  };
  table: AnalyticsSlaTableRow[];
}
