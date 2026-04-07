import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@pulseops/supabase/types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { loadLocationNameMap, loadProfileLabelMap } from '@/lib/data/load-label-maps';
import type {
  AdminActivitySummary,
  AuditLogListItem,
} from '@/features/audit/types/audit.types';

type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];

export async function listAuditLogsFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    limit?: number;
  },
): Promise<AuditLogListItem[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', input.tenantId)
    .order('created_at', { ascending: false })
    .limit(input.limit ?? 50);

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

  return data.map((row) => mapAuditLogListItem(row, locationNames, actorNames));
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

function mapAuditLogListItem(
  row: AuditLogRow,
  locationNames: Map<string, string>,
  actorNames: Map<string, string>,
): AuditLogListItem {
  return {
    id: row.id,
    action: row.action,
    actorName: row.actor_user_id
      ? (actorNames.get(row.actor_user_id) ?? 'Unknown teammate')
      : row.actor_type === 'system'
        ? 'System'
        : row.actor_type === 'service'
          ? 'Service'
          : 'Unknown actor',
    actorType: row.actor_type,
    entityType: row.entity_type,
    entityLabel: row.entity_label,
    scope: row.scope,
    createdAtLabel: formatDateTimeLabel(row.created_at),
    locationName: row.location_id ? (locationNames.get(row.location_id) ?? null) : null,
  };
}
