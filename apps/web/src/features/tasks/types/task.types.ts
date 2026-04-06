import type { JobPriority } from '@/features/jobs/types/job.types';

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled';

export interface TaskListItem {
  id: string;
  reference: string;
  title: string;
  branchId: string;
  branchName: string;
  priority: JobPriority;
  status: TaskStatus;
  dueAtLabel: string;
  assigneeName: string | null;
  linkedRecordLabel: string | null;
}

export interface TaskTimelineEntry {
  id: string;
  type: 'created' | 'assignment' | 'status_change' | 'note' | 'completed';
  title: string;
  description: string;
  timestampLabel: string;
  actorName: string;
}

export interface TaskLinkedRecord {
  id: string;
  reference: string;
}

export interface TaskDetail {
  id: string;
  reference: string;
  title: string;
  summary: string;
  branchId: string;
  branchName: string;
  priority: JobPriority;
  status: TaskStatus;
  dueAtLabel: string;
  assigneeName: string | null;
  currentAssigneeUserId: string | null;
  createdByName: string;
  completionSummary: string | null;
  linkedIncident: TaskLinkedRecord | null;
  linkedJob: TaskLinkedRecord | null;
  timeline: TaskTimelineEntry[];
}

export interface TaskLinkOption {
  id: string;
  reference: string;
  title: string;
  locationId: string;
  entityType: 'incident' | 'job';
}

export interface CreateTaskActionState {
  error?: string;
}
