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
}
