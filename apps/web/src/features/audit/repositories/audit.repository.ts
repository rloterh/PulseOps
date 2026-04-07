import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@pulseops/supabase/types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { loadLocationNameMap, loadProfileLabelMap } from '@/lib/data/load-label-maps';
import type {
  AuditActivityFilterOptions,
  AuditActivityFilters,
  AuditActivityPagination,
  AdminActivitySummary,
  AuditLogListItem,
} from '@/features/audit/types/audit.types';

type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];

export async function listAuditLogsFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    limit?: number;
    offset?: number;
    filters?: AuditActivityFilters;
  },
): Promise<{ logs: AuditLogListItem[]; total: number }> {
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .eq('organization_id', input.tenantId)
    .order('created_at', { ascending: false })
    .range(input.offset ?? 0, (input.offset ?? 0) + (input.limit ?? 50) - 1);

  if (input.filters?.scope && input.filters.scope !== 'all') {
    query = query.eq('scope', input.filters.scope);
  }

  if (input.filters?.actorUserId && input.filters.actorUserId !== 'all') {
    query = query.eq('actor_user_id', input.filters.actorUserId);
  }

  if (input.filters?.entityType && input.filters.entityType !== 'all') {
    query = query.eq('entity_type', input.filters.entityType);
  }

  if (input.filters?.locationId && input.filters.locationId !== 'all') {
    query = query.eq('location_id', input.filters.locationId);
  }

  if (input.filters?.q) {
    const q = sanitizeSearchQuery(input.filters.q);
    query = query.or(
      `action.ilike.%${q}%,entity_label.ilike.%${q}%,entity_type.ilike.%${q}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const locationNames = await loadLocationNameMap(
    supabase,
    data.flatMap((row) => (row.location_id ? [row.location_id] : [])),
  );
  const actorNames = await loadProfileLabelMap(
    supabase,
    data.flatMap((row) => (row.actor_user_id ? [row.actor_user_id] : [])),
  );

  return {
    logs: data.map((row) => mapAuditLogListItem(row, locationNames, actorNames)),
    total: count ?? data.length,
  };
}

export async function insertAuditLogInDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    locationId?: string | null;
    actorType?: Database['public']['Enums']['audit_actor_type'];
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    entityLabel?: string | null;
    scope?: string | null;
    requestId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Json;
  },
) {
  const { error } = await supabase.from('audit_logs').insert({
    organization_id: input.tenantId,
    location_id: input.locationId ?? null,
    actor_type: input.actorType ?? 'user',
    actor_user_id: input.actorUserId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    entity_label: input.entityLabel ?? null,
    scope: input.scope ?? null,
    request_id: input.requestId ?? null,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }
}

export function summarizeAuditLogs(logs: AuditLogListItem[]): AdminActivitySummary {
  return {
    total: logs.length,
    incidentActions: logs.filter((log) => log.scope === 'incident').length,
    escalationActions: logs.filter((log) => log.action.includes('escalat')).length,
    billingActions: logs.filter((log) => log.scope === 'billing').length,
  };
}

export function buildAuditPagination(input: {
  page: number;
  pageSize: number;
  total: number;
}): AuditActivityPagination {
  return {
    page: input.page,
    pageSize: input.pageSize,
    total: input.total,
    hasPrevious: input.page > 1,
    hasNext: input.page * input.pageSize < input.total,
  };
}

export async function getAuditActivityFilterOptionsFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
  },
): Promise<AuditActivityFilterOptions> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', input.tenantId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  const locationNames = await loadLocationNameMap(
    supabase,
    data.flatMap((row) => (row.location_id ? [row.location_id] : [])),
  );
  const actorNames = await loadProfileLabelMap(
    supabase,
    data.flatMap((row) => (row.actor_user_id ? [row.actor_user_id] : [])),
  );

  return {
    actors: uniqueOptions(
      data
        .filter((row): row is AuditLogRow & { actor_user_id: string } => Boolean(row.actor_user_id))
        .map((row) => ({
          value: row.actor_user_id,
          label: actorNames.get(row.actor_user_id) ?? 'Unknown teammate',
        })),
    ),
    scopes: uniqueOptions(
      data
        .filter((row): row is AuditLogRow & { scope: string } => Boolean(row.scope))
        .map((row) => ({
          value: row.scope,
          label: formatTokenLabel(row.scope),
        })),
    ),
    entityTypes: uniqueOptions(
      data.map((row) => ({
        value: row.entity_type,
        label: formatTokenLabel(row.entity_type),
      })),
    ),
    locations: uniqueOptions(
      data
        .filter((row): row is AuditLogRow & { location_id: string } => Boolean(row.location_id))
        .map((row) => ({
          value: row.location_id,
          label: locationNames.get(row.location_id) ?? 'Unknown branch',
        })),
    ),
  };
}

function mapAuditLogListItem(
  row: AuditLogRow,
  locationNames: Map<string, string>,
  actorNames: Map<string, string>,
): AuditLogListItem {
  return {
    id: row.id,
    action: row.action,
    actionLabel: formatTokenLabel(row.action.replace(/\./g, ' ')),
    actorName: row.actor_user_id
      ? (actorNames.get(row.actor_user_id) ?? 'Unknown teammate')
      : row.actor_type === 'system'
        ? 'System'
        : row.actor_type === 'service'
          ? 'Service'
          : 'Unknown actor',
    actorUserId: row.actor_user_id,
    actorType: row.actor_type,
    entityType: row.entity_type,
    entityLabel: row.entity_label,
    scope: row.scope,
    locationId: row.location_id,
    createdAtLabel: formatDateTimeLabel(row.created_at),
    createdAt: row.created_at,
    locationName: row.location_id ? (locationNames.get(row.location_id) ?? null) : null,
    entityId: row.entity_id,
    metadata:
      row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    requestId: row.request_id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
  };
}

function uniqueOptions<T extends { value: string; label: string }>(options: T[]) {
  const seen = new Set<string>();

  return options.filter((option) => {
    if (seen.has(option.value)) {
      return false;
    }

    seen.add(option.value);
    return true;
  });
}

function sanitizeSearchQuery(query: string) {
  return query.replace(/[,%()]/g, ' ').trim();
}
