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
