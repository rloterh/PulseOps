export type JobPriority = 'urgent' | 'high' | 'medium' | 'low';

export type JobStatus =
  | 'new'
  | 'scheduled'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled';

export type JobType = 'reactive' | 'preventive' | 'inspection' | 'vendor';

export interface JobListFilters {
  q?: string;
  priority?: JobPriority | 'all';
  status?: JobStatus | 'all';
  type?: JobType | 'all';
}

export interface JobListItem {
  id: string;
  reference: string;
  title: string;
  branchId: string;
  branchName: string;
  siteName: string;
  priority: JobPriority;
  status: JobStatus;
  type: JobType;
  dueAtLabel: string;
  assigneeName: string | null;
  linkedIncidentId: string | null;
}

export interface JobTimelineEntry {
  id: string;
  type: 'created' | 'scheduled' | 'assignment' | 'status_change' | 'note' | 'completed';
  title: string;
  description: string;
  timestampLabel: string;
  actorName: string;
}

export interface JobLinkedIncident {
  id: string;
  reference: string;
}

export interface CreateJobActionState {
  error?: string;
}

export interface JobDetail {
  id: string;
  reference: string;
  title: string;
  summary: string;
  branchId: string;
  branchName: string;
  siteName: string;
  customerName: string;
  priority: JobPriority;
  status: JobStatus;
  type: JobType;
  dueAtLabel: string;
  assigneeName: string | null;
  currentAssigneeUserId: string | null;
  linkedIncident: JobLinkedIncident | null;
  checklistSummary: string;
  resolutionSummary: string | null;
  timeline: JobTimelineEntry[];
}
