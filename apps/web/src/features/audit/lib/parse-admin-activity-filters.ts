import type {
  AuditActivityFilters,
  AuditActivityFilterOptions,
} from '@/features/audit/types/audit.types';

export const DEFAULT_AUDIT_ACTIVITY_FILTERS: AuditActivityFilters = {
  q: '',
  scope: 'all',
  actorUserId: 'all',
  entityType: 'all',
  locationId: 'all',
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeText(value: string | undefined) {
  return value?.trim() ?? '';
}

function normalizeOption(
  value: string | undefined,
  allowedValues: Set<string>,
  fallback: string,
) {
  return value && allowedValues.has(value) ? value : fallback;
}

export function parseAdminActivityFilters(
  searchParams: Record<string, string | string[] | undefined>,
  options: AuditActivityFilterOptions,
): AuditActivityFilters {
  const scopeValues = new Set(['all', ...options.scopes.map((option) => option.value)]);
  const actorValues = new Set(['all', ...options.actors.map((option) => option.value)]);
  const entityTypeValues = new Set([
    'all',
    ...options.entityTypes.map((option) => option.value),
  ]);
  const locationValues = new Set([
    'all',
    ...options.locations.map((option) => option.value),
  ]);

  const q = sanitizeText(getSingleValue(searchParams.q));
  const scope = normalizeOption(
    getSingleValue(searchParams.scope),
    scopeValues,
    DEFAULT_AUDIT_ACTIVITY_FILTERS.scope,
  );
  const actorUserId = normalizeOption(
    getSingleValue(searchParams.actorUserId),
    actorValues,
    DEFAULT_AUDIT_ACTIVITY_FILTERS.actorUserId,
  );
  const entityType = normalizeOption(
    getSingleValue(searchParams.entityType),
    entityTypeValues,
    DEFAULT_AUDIT_ACTIVITY_FILTERS.entityType,
  );
  const locationId = normalizeOption(
    getSingleValue(searchParams.locationId),
    locationValues,
    DEFAULT_AUDIT_ACTIVITY_FILTERS.locationId,
  );

  return {
    q,
    scope,
    actorUserId,
    entityType,
    locationId,
  };
}
