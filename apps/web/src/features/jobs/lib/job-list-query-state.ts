import type {
  JobListFilters,
  JobListSortDirection,
  JobListSortField,
} from '@/features/jobs/types/job.types';

export const DEFAULT_JOB_LIST_FILTERS: Required<
  Pick<JobListFilters, 'priority' | 'status' | 'type' | 'sort' | 'direction'>
> = {
  priority: 'all',
  status: 'all',
  type: 'all',
  sort: 'due_at',
  direction: 'asc',
};

export function serializeJobListFilters(filters: JobListFilters) {
  const searchParams = new URLSearchParams();

  if (filters.q?.trim()) {
    searchParams.set('q', filters.q.trim());
  }

  if (
    filters.priority &&
    filters.priority !== DEFAULT_JOB_LIST_FILTERS.priority
  ) {
    searchParams.set('priority', filters.priority);
  }

  if (filters.status && filters.status !== DEFAULT_JOB_LIST_FILTERS.status) {
    searchParams.set('status', filters.status);
  }

  if (filters.type && filters.type !== DEFAULT_JOB_LIST_FILTERS.type) {
    searchParams.set('type', filters.type);
  }

  if (filters.sort && filters.sort !== DEFAULT_JOB_LIST_FILTERS.sort) {
    searchParams.set('sort', filters.sort);
  }

  if (
    filters.direction &&
    filters.direction !== DEFAULT_JOB_LIST_FILTERS.direction
  ) {
    searchParams.set('direction', filters.direction);
  }

  return searchParams;
}

export function toggleJobListSort(
  current: JobListFilters,
  field: JobListSortField,
): JobListFilters {
  if (current.sort !== field) {
    return {
      ...current,
      sort: field,
      direction: 'asc',
    };
  }

  if (current.direction !== 'desc') {
    return {
      ...current,
      sort: field,
      direction: 'desc',
    };
  }

  return {
    ...current,
    sort: DEFAULT_JOB_LIST_FILTERS.sort,
    direction: DEFAULT_JOB_LIST_FILTERS.direction,
  };
}

export function getJobListSortDirection(
  current: JobListFilters,
  field: JobListSortField,
): JobListSortDirection | null {
  return current.sort === field ? (current.direction ?? 'asc') : null;
}
