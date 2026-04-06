import type { IncidentListFilters, IncidentSeverity, IncidentStatus } from '@/features/incidents/types/incident.types';

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

export function parseIncidentListFilters(searchParams: Record<string, string | string[] | undefined>): IncidentListFilters {
  const q = getSingleValue(searchParams.q)?.trim();
  const severity = getSingleValue(searchParams.severity);
  const status = getSingleValue(searchParams.status);
  const slaRisk = getSingleValue(searchParams.slaRisk);
  const normalizedSlaRisk: NonNullable<IncidentListFilters['slaRisk']> = SLA_FILTERS.has(
    (slaRisk ?? 'all') as IncidentListFilters['slaRisk'],
  )
    ? ((slaRisk ?? 'all') as NonNullable<IncidentListFilters['slaRisk']>)
    : 'all';

  const filters: IncidentListFilters = {
    severity: INCIDENT_SEVERITIES.has((severity ?? 'all') as IncidentSeverity | 'all')
      ? ((severity ?? 'all') as IncidentSeverity | 'all')
      : 'all',
    status: INCIDENT_STATUSES.has((status ?? 'all') as IncidentStatus | 'all')
      ? ((status ?? 'all') as IncidentStatus | 'all')
      : 'all',
    slaRisk: normalizedSlaRisk,
  };

  if (q?.length) {
    filters.q = q;
  }

  return filters;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
