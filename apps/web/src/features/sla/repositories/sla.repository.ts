import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';
import type {
  SlaEntityType,
  SlaPolicyRecord,
  WorkItemSlaSnapshot,
} from '@/features/sla/types/sla.types';

export async function getSlaPoliciesFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    branchId?: string | null;
    activeOnly?: boolean;
  },
): Promise<SlaPolicyRecord[]> {
  let query = supabase
    .from('sla_policies')
    .select('*')
    .eq('organization_id', input.tenantId)
    .order('precedence', { ascending: true })
    .order('created_at', { ascending: true });

  if (input.branchId) {
    query = query.or(`location_id.is.null,location_id.eq.${input.branchId}`);
  }

  if (input.activeOnly ?? true) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getSlaPolicyByIdFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    policyId: string | null;
  },
): Promise<SlaPolicyRecord | null> {
  if (!input.policyId) {
    return null;
  }

  const { data, error } = await supabase
    .from('sla_policies')
    .select('*')
    .eq('organization_id', input.tenantId)
    .eq('id', input.policyId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getWorkItemSlaSnapshotFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    entityType: SlaEntityType;
    entityId: string;
  },
): Promise<WorkItemSlaSnapshot | null> {
  const { data, error } = await supabase
    .from('work_item_slas')
    .select('*')
    .eq('organization_id', input.tenantId)
    .eq('entity_type', input.entityType)
    .eq('entity_id', input.entityId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertWorkItemSlaSnapshotInDb(
  supabase: SupabaseClient<Database>,
  input: {
    entityId: string;
    entityType: SlaEntityType;
    firstResponseAt?: string | null;
    branchId: string;
    openedAt: string;
    tenantId: string;
    priority?: Database['public']['Enums']['job_priority'] | null;
    resolvedAt?: string | null;
    severity?: Database['public']['Enums']['incident_severity'] | null;
    status: string;
  },
): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_work_item_sla_snapshot', {
    p_entity_id: input.entityId,
    p_entity_type: input.entityType,
    p_first_response_at: input.firstResponseAt ?? null,
    p_location_id: input.branchId,
    p_opened_at: input.openedAt,
    p_organization_id: input.tenantId,
    p_priority: input.priority ?? null,
    p_resolved_at: input.resolvedAt ?? null,
    p_severity: input.severity ?? null,
    p_status: input.status,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateWorkItemSlaEvaluationInDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    entityType: SlaEntityType;
    entityId: string;
    riskLevel: Database['public']['Enums']['sla_risk_level'];
    escalationState: Database['public']['Enums']['sla_escalation_state'];
    warningSentAt: string | null;
    firstResponseBreachedAt: string | null;
    resolutionBreachedAt: string | null;
    escalationTriggeredAt: string | null;
  },
) {
  const { error } = await supabase
    .from('work_item_slas')
    .update({
      risk_level: input.riskLevel,
      escalation_state: input.escalationState,
      warning_sent_at: input.warningSentAt,
      first_response_breached_at: input.firstResponseBreachedAt,
      resolution_breached_at: input.resolutionBreachedAt,
      escalation_triggered_at: input.escalationTriggeredAt,
      last_evaluated_at: new Date().toISOString(),
    })
    .eq('organization_id', input.tenantId)
    .eq('entity_type', input.entityType)
    .eq('entity_id', input.entityId);

  if (error) {
    throw new Error(error.message);
  }
}
