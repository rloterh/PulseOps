import type { JobListFilters, JobPriority, JobStatus, JobType } from '@/features/jobs/types/job.types';

const JOB_PRIORITIES = new Set<JobPriority | 'all'>(['all', 'urgent', 'high', 'medium', 'low']);
const JOB_STATUSES = new Set<JobStatus | 'all'>([
  'all',
  'new',
  'scheduled',
  'in_progress',
  'blocked',
  'completed',
  'cancelled',
]);
const JOB_TYPES = new Set<JobType | 'all'>(['all', 'reactive', 'preventive', 'inspection', 'vendor']);

export function parseJobListFilters(searchParams: Record<string, string | string[] | undefined>): JobListFilters {
  const q = getSingleValue(searchParams.q)?.trim();
  const priority = getSingleValue(searchParams.priority);
  const status = getSingleValue(searchParams.status);
  const type = getSingleValue(searchParams.type);

  const filters: JobListFilters = {
    priority: JOB_PRIORITIES.has((priority ?? 'all') as JobPriority | 'all')
      ? ((priority ?? 'all') as JobPriority | 'all')
      : 'all',
    status: JOB_STATUSES.has((status ?? 'all') as JobStatus | 'all')
      ? ((status ?? 'all') as JobStatus | 'all')
      : 'all',
    type: JOB_TYPES.has((type ?? 'all') as JobType | 'all')
      ? ((type ?? 'all') as JobType | 'all')
      : 'all',
  };

  if (q?.length) {
    filters.q = q;
  }

  return filters;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
