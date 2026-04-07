import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';
import { evaluateWorkItemSla } from '@/features/sla/lib/evaluate-work-item-sla';
import {
  getSlaPolicyByIdFromDb,
  getWorkItemSlaSnapshotFromDb,
  updateWorkItemSlaEvaluationInDb,
  upsertWorkItemSlaSnapshotInDb,
} from '@/features/sla/repositories/sla.repository';

type IncidentSlaRow = Pick<
  Database['public']['Tables']['incidents']['Row'],
  | 'id'
  | 'organization_id'
  | 'location_id'
  | 'opened_at'
  | 'first_response_at'
  | 'resolved_at'
  | 'severity'
  | 'status'
  | 'sla_risk'
>;

export async function syncIncidentSlaState(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    incidentId: string;
  },
) {
  const { data: incident, error } = await supabase
    .from('incidents')
    .select(
      'id, organization_id, location_id, opened_at, first_response_at, resolved_at, severity, status, sla_risk',
    )
    .eq('organization_id', input.tenantId)
    .eq('id', input.incidentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!incident) {
    return null;
  }

  return syncIncidentSlaStateFromRow(supabase, incident);
}

export async function syncIncidentSlaStateFromRow(
  supabase: SupabaseClient<Database>,
  incident: IncidentSlaRow,
) {
  await upsertWorkItemSlaSnapshotInDb(supabase, {
    tenantId: incident.organization_id,
    branchId: incident.location_id,
    entityType: 'incident',
    entityId: incident.id,
    openedAt: incident.opened_at,
    firstResponseAt: incident.first_response_at,
    resolvedAt: incident.resolved_at,
    severity: incident.severity,
    status: incident.status,
  });

  const [snapshot, latestOpenEscalation] = await Promise.all([
    getWorkItemSlaSnapshotFromDb(supabase, {
      tenantId: incident.organization_id,
      entityType: 'incident',
      entityId: incident.id,
    }),
    supabase
      .from('incident_escalations')
      .select('triggered_at')
      .eq('organization_id', incident.organization_id)
      .eq('incident_id', incident.id)
      .in('status', ['pending', 'sent', 'acknowledged'])
      .order('triggered_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!snapshot) {
    return null;
  }

  if (latestOpenEscalation.error) {
    throw new Error(latestOpenEscalation.error.message);
  }

  const policy = await getSlaPolicyByIdFromDb(supabase, {
    tenantId: incident.organization_id,
    policyId: snapshot.policy_id,
  });
  const evaluation = evaluateWorkItemSla(snapshot, {
    policy,
    openEscalationTriggeredAt: latestOpenEscalation.data?.triggered_at ?? null,
  });

  await updateWorkItemSlaEvaluationInDb(supabase, {
    tenantId: incident.organization_id,
    entityType: 'incident',
    entityId: incident.id,
    riskLevel: evaluation.riskLevel,
    escalationState: evaluation.escalationState,
    warningSentAt: evaluation.warningSentAt,
    firstResponseBreachedAt: evaluation.firstResponseBreachedAt,
    resolutionBreachedAt: evaluation.resolutionBreachedAt,
    escalationTriggeredAt: evaluation.escalationTriggeredAt,
  });

  if (incident.sla_risk !== evaluation.isAtRisk) {
    const { error: updateError } = await supabase
      .from('incidents')
      .update({
        sla_risk: evaluation.isAtRisk,
      })
      .eq('organization_id', incident.organization_id)
      .eq('id', incident.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return getWorkItemSlaSnapshotFromDb(supabase, {
    tenantId: incident.organization_id,
    entityType: 'incident',
    entityId: incident.id,
  });
}
