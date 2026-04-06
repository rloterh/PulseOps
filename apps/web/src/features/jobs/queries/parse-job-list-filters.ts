import {
  DEFAULT_JOB_LIST_FILTERS,
} from '@/features/jobs/lib/job-list-query-state';
import type {
  JobListFilters,
  JobListSortDirection,
  JobListSortField,
  JobPriority,
  JobStatus,
  JobType,
} from '@/features/jobs/types/job.types';

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
const JOB_SORT_FIELDS = new Set<JobListSortField>([
  'due_at',
  'title',
  'priority',
  'status',
]);
const JOB_SORT_DIRECTIONS = new Set<JobListSortDirection>(['asc', 'desc']);

export function parseJobListFilters(searchParams: Record<string, string | string[] | undefined>): JobListFilters {
  const q = getSingleValue(searchParams.q)?.trim();
  const priority = getSingleValue(searchParams.priority);
  const status = getSingleValue(searchParams.status);
  const type = getSingleValue(searchParams.type);
  const sort = getSingleValue(searchParams.sort);
  const direction = getSingleValue(searchParams.direction);

  const filters: JobListFilters = {
    priority: JOB_PRIORITIES.has(
      (priority ?? DEFAULT_JOB_LIST_FILTERS.priority) as JobPriority | 'all',
    )
      ? ((priority ?? DEFAULT_JOB_LIST_FILTERS.priority) as JobPriority | 'all')
      : DEFAULT_JOB_LIST_FILTERS.priority,
    status: JOB_STATUSES.has(
      (status ?? DEFAULT_JOB_LIST_FILTERS.status) as JobStatus | 'all',
    )
      ? ((status ?? DEFAULT_JOB_LIST_FILTERS.status) as JobStatus | 'all')
      : DEFAULT_JOB_LIST_FILTERS.status,
    type: JOB_TYPES.has((type ?? DEFAULT_JOB_LIST_FILTERS.type) as JobType | 'all')
      ? ((type ?? DEFAULT_JOB_LIST_FILTERS.type) as JobType | 'all')
      : DEFAULT_JOB_LIST_FILTERS.type,
    sort: JOB_SORT_FIELDS.has(
      (sort ?? DEFAULT_JOB_LIST_FILTERS.sort) as JobListSortField,
    )
      ? ((sort ?? DEFAULT_JOB_LIST_FILTERS.sort) as JobListSortField)
      : DEFAULT_JOB_LIST_FILTERS.sort,
    direction: JOB_SORT_DIRECTIONS.has(
      (direction ?? DEFAULT_JOB_LIST_FILTERS.direction) as JobListSortDirection,
    )
      ? ((direction ?? DEFAULT_JOB_LIST_FILTERS.direction) as JobListSortDirection)
      : DEFAULT_JOB_LIST_FILTERS.direction,
  };

  if (q?.length) {
    filters.q = q;
  }

  return filters;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
