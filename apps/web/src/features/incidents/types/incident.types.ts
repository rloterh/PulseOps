export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus =
  | 'open'
  | 'investigating'
  | 'monitoring'
  | 'resolved'
  | 'closed';

export interface IncidentListFilters {
  q?: string;
  severity?: IncidentSeverity | 'all';
  status?: IncidentStatus | 'all';
  slaRisk?: 'all' | 'at-risk' | 'healthy';
}

export interface IncidentListItem {
  id: string;
  reference: string;
  title: string;
  branchId: string;
  branchName: string;
  siteName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  slaRisk: boolean;
  openedAtLabel: string;
  ownerName: string;
  assigneeName: string | null;
}

export interface IncidentTimelineEntry {
  id: string;
  type: 'created' | 'assignment' | 'status_change' | 'note' | 'resolution';
  title: string;
  description: string;
  timestampLabel: string;
  actorName: string;
}

export interface IncidentLinkedJob {
  id: string;
  reference: string;
}

export interface IncidentDetail {
  id: string;
  reference: string;
  title: string;
  summary: string;
  branchId: string;
  branchName: string;
  siteName: string;
  customerName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  slaRisk: boolean;
  openedAtLabel: string;
  ownerName: string;
  assigneeName: string | null;
  currentAssigneeUserId: string | null;
  impactSummary: string;
  nextAction: string;
  linkedJobs: IncidentLinkedJob[];
  timeline: IncidentTimelineEntry[];
}

export interface CreateIncidentActionState {
  error?: string;
}

export interface IncidentEditRecord {
  id: string;
  branchId: string;
  branchName: string;
  title: string;
  summary: string;
  customerName: string;
  severity: IncidentSeverity;
  reportedAt: string;
  slaRisk: boolean;
  impactSummary: string;
  nextAction: string;
}
