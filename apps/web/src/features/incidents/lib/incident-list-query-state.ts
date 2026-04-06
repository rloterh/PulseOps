import type {
  IncidentListFilters,
  IncidentListSortDirection,
  IncidentListSortField,
} from '@/features/incidents/types/incident.types';

export const DEFAULT_INCIDENT_LIST_FILTERS: Required<
  Pick<IncidentListFilters, 'severity' | 'status' | 'slaRisk' | 'sort' | 'direction'>
> = {
  severity: 'all',
  status: 'all',
  slaRisk: 'all',
  sort: 'opened_at',
  direction: 'desc',
};

export function serializeIncidentListFilters(filters: IncidentListFilters) {
  const searchParams = new URLSearchParams();

  if (filters.q?.trim()) {
    searchParams.set('q', filters.q.trim());
  }

  if (
    filters.severity &&
    filters.severity !== DEFAULT_INCIDENT_LIST_FILTERS.severity
  ) {
    searchParams.set('severity', filters.severity);
  }

  if (
    filters.status &&
    filters.status !== DEFAULT_INCIDENT_LIST_FILTERS.status
  ) {
    searchParams.set('status', filters.status);
  }

  if (
    filters.slaRisk &&
    filters.slaRisk !== DEFAULT_INCIDENT_LIST_FILTERS.slaRisk
  ) {
    searchParams.set('slaRisk', filters.slaRisk);
  }

  if (filters.sort && filters.sort !== DEFAULT_INCIDENT_LIST_FILTERS.sort) {
    searchParams.set('sort', filters.sort);
  }

  if (
    filters.direction &&
    filters.direction !== DEFAULT_INCIDENT_LIST_FILTERS.direction
  ) {
    searchParams.set('direction', filters.direction);
  }

  return searchParams;
}

export function toggleIncidentListSort(
  current: IncidentListFilters,
  field: IncidentListSortField,
): IncidentListFilters {
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
    sort: DEFAULT_INCIDENT_LIST_FILTERS.sort,
    direction: DEFAULT_INCIDENT_LIST_FILTERS.direction,
  };
}

export function getIncidentListSortDirection(
  current: IncidentListFilters,
  field: IncidentListSortField,
): IncidentListSortDirection | null {
  return current.sort === field ? (current.direction ?? 'asc') : null;
}
