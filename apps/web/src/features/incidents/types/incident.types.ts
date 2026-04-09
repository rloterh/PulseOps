export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus =
  | 'open'
  | 'investigating'
  | 'monitoring'
  | 'resolved'
  | 'closed';
export type IncidentListSortField =
  | 'opened_at'
  | 'title'
  | 'severity'
  | 'status';
export type IncidentListSortDirection = 'asc' | 'desc';

export interface IncidentListFilters {
  q?: string;
  severity?: IncidentSeverity | 'all';
  status?: IncidentStatus | 'all';
  slaRisk?: 'all' | 'at-risk' | 'healthy';
  sort?: IncidentListSortField;
  direction?: IncidentListSortDirection;
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
  type:
    | 'created'
    | 'assignment'
    | 'status_change'
    | 'note'
    | 'resolution'
    | 'escalation';
  title: string;
  description: string;
  timestampLabel: string;
  actorName: string;
}

export interface IncidentEscalationEntry {
  id: string;
  escalationLevel: number;
  status: 'pending' | 'sent' | 'acknowledged' | 'completed' | 'cancelled';
  reason: string | null;
  targetLabel: string;
  targetUserId: string | null;
  triggeredByName: string;
  acknowledgedByName: string | null;
  triggeredAtLabel: string;
  acknowledgedAtLabel: string | null;
  completedAtLabel: string | null;
}

export interface IncidentSlaSummary {
  riskLevel: 'normal' | 'at_risk' | 'breached';
  escalationState: 'none' | 'warning' | 'escalated';
  statusCategory: 'active' | 'paused' | 'terminal';
  policyName: string | null;
  firstResponseDueAtLabel: string | null;
  resolutionDueAtLabel: string | null;
  firstRespondedAtLabel: string | null;
  resolvedAtLabel: string | null;
  firstResponseBreachedAtLabel: string | null;
  resolutionBreachedAtLabel: string | null;
  warningSentAtLabel: string | null;
  escalationTriggeredAtLabel: string | null;
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
  escalationLevel: number;
  openedAtLabel: string;
  acknowledgedAtLabel: string | null;
  resolvedAtLabel: string | null;
  closedAtLabel: string | null;
  ownerName: string;
  assigneeName: string | null;
  currentAssigneeUserId: string | null;
  impactSummary: string;
  nextAction: string;
  linkedJobs: IncidentLinkedJob[];
  escalations: IncidentEscalationEntry[];
  sla: IncidentSlaSummary | null;
  timeline: IncidentTimelineEntry[];
}

export interface CreateIncidentActionState {
  error?: string;
}

export interface IncidentEscalationActionState {
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
