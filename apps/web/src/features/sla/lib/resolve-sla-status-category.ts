import type { IncidentStatus } from '@/features/incidents/types/incident.types';
import type { JobStatus } from '@/features/jobs/types/job.types';
import type { SlaEntityType, SlaStatusCategory } from '@/features/sla/types/sla.types';
import type { TaskStatus } from '@/features/tasks/types/task.types';

const PAUSED_STATUSES = new Set([
  'waiting_on_customer',
  'waiting_on_third_party',
  'on_hold',
]);

const TERMINAL_INCIDENT_STATUSES = new Set<IncidentStatus>(['resolved', 'closed']);
const TERMINAL_JOB_STATUSES = new Set<JobStatus>(['completed', 'cancelled']);
const TERMINAL_TASK_STATUSES = new Set<TaskStatus>(['completed', 'cancelled']);

export function resolveSlaStatusCategory(
  entityType: SlaEntityType,
  status: string,
): SlaStatusCategory {
  if (PAUSED_STATUSES.has(status)) {
    return 'paused';
  }

  if (entityType === 'incident') {
    return TERMINAL_INCIDENT_STATUSES.has(status as IncidentStatus)
      ? 'terminal'
      : 'active';
  }

  if (entityType === 'job') {
    return TERMINAL_JOB_STATUSES.has(status as JobStatus) ? 'terminal' : 'active';
  }

  return TERMINAL_TASK_STATUSES.has(status as TaskStatus) ? 'terminal' : 'active';
}
