import type { AuditActivityFilters } from '@/features/audit/types/audit.types';

export function buildAdminActivityQuery(
  filters: AuditActivityFilters,
  page: number,
) {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set('q', filters.q);
  }

  if (filters.scope !== 'all') {
    params.set('scope', filters.scope);
  }

  if (filters.actorUserId !== 'all') {
    params.set('actorUserId', filters.actorUserId);
  }

  if (filters.entityType !== 'all') {
    params.set('entityType', filters.entityType);
  }

  if (filters.locationId !== 'all') {
    params.set('locationId', filters.locationId);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  return params.toString();
}
