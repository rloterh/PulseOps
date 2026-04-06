import {
  DEFAULT_INCIDENT_LIST_FILTERS,
} from '@/features/incidents/lib/incident-list-query-state';
import type {
  IncidentListFilters,
  IncidentListSortDirection,
  IncidentListSortField,
  IncidentSeverity,
  IncidentStatus,
} from '@/features/incidents/types/incident.types';

const INCIDENT_SEVERITIES = new Set<IncidentSeverity | 'all'>([
  'all',
  'critical',
  'high',
  'medium',
  'low',
]);

const INCIDENT_STATUSES = new Set<IncidentStatus | 'all'>([
  'all',
  'open',
  'investigating',
  'monitoring',
  'resolved',
  'closed',
]);

const SLA_FILTERS = new Set<IncidentListFilters['slaRisk']>(['all', 'at-risk', 'healthy']);
const INCIDENT_SORT_FIELDS = new Set<IncidentListSortField>([
  'opened_at',
  'title',
  'severity',
  'status',
]);
const INCIDENT_SORT_DIRECTIONS = new Set<IncidentListSortDirection>(['asc', 'desc']);

export function parseIncidentListFilters(searchParams: Record<string, string | string[] | undefined>): IncidentListFilters {
  const q = getSingleValue(searchParams.q)?.trim();
  const severity = getSingleValue(searchParams.severity);
  const status = getSingleValue(searchParams.status);
  const slaRisk = getSingleValue(searchParams.slaRisk);
  const sort = getSingleValue(searchParams.sort);
  const direction = getSingleValue(searchParams.direction);
  const normalizedSlaRisk: NonNullable<IncidentListFilters['slaRisk']> = SLA_FILTERS.has(
    (slaRisk ?? DEFAULT_INCIDENT_LIST_FILTERS.slaRisk) as IncidentListFilters['slaRisk'],
  )
    ? ((slaRisk ?? DEFAULT_INCIDENT_LIST_FILTERS.slaRisk) as NonNullable<IncidentListFilters['slaRisk']>)
    : DEFAULT_INCIDENT_LIST_FILTERS.slaRisk;

  const filters: IncidentListFilters = {
    severity: INCIDENT_SEVERITIES.has(
      (severity ?? DEFAULT_INCIDENT_LIST_FILTERS.severity) as IncidentSeverity | 'all',
    )
      ? ((severity ?? DEFAULT_INCIDENT_LIST_FILTERS.severity) as IncidentSeverity | 'all')
      : DEFAULT_INCIDENT_LIST_FILTERS.severity,
    status: INCIDENT_STATUSES.has(
      (status ?? DEFAULT_INCIDENT_LIST_FILTERS.status) as IncidentStatus | 'all',
    )
      ? ((status ?? DEFAULT_INCIDENT_LIST_FILTERS.status) as IncidentStatus | 'all')
      : DEFAULT_INCIDENT_LIST_FILTERS.status,
    slaRisk: normalizedSlaRisk,
    sort: INCIDENT_SORT_FIELDS.has(
      (sort ?? DEFAULT_INCIDENT_LIST_FILTERS.sort) as IncidentListSortField,
    )
      ? ((sort ?? DEFAULT_INCIDENT_LIST_FILTERS.sort) as IncidentListSortField)
      : DEFAULT_INCIDENT_LIST_FILTERS.sort,
    direction: INCIDENT_SORT_DIRECTIONS.has(
      (direction ?? DEFAULT_INCIDENT_LIST_FILTERS.direction) as IncidentListSortDirection,
    )
      ? ((direction ?? DEFAULT_INCIDENT_LIST_FILTERS.direction) as IncidentListSortDirection)
      : DEFAULT_INCIDENT_LIST_FILTERS.direction,
  };

  if (q?.length) {
    filters.q = q;
  }

  return filters;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
