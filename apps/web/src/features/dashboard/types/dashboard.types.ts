export interface DashboardKpi {
  label: string;
  value: string;
  delta: string;
  direction: 'up' | 'down' | 'neutral';
  helperText: string;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardJobItem {
  id: string;
  title: string;
  dueLabel: string;
  assigneeLabel: string;
  status:
    | 'new'
    | 'scheduled'
    | 'in_progress'
    | 'blocked'
    | 'completed'
    | 'cancelled';
}

export interface DashboardIncidentItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'monitoring' | 'resolved' | 'closed';
  openedLabel: string;
}

export interface BranchHealthStat {
  label: string;
  value: string;
  tone: 'default' | 'success' | 'warning' | 'danger';
}

export interface DashboardSummary {
  kpis: DashboardKpi[];
  incidents: DashboardIncidentItem[];
  upcomingJobs: DashboardJobItem[];
  recentActivity: DashboardActivityItem[];
  branchHealth: BranchHealthStat[];
  slaRiskCount: number;
}
