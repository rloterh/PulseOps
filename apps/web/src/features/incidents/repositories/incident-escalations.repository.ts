import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { loadProfileLabelMap } from '@/lib/data/load-label-maps';
import type { IncidentEscalationEntry } from '@/features/incidents/types/incident.types';

type IncidentEscalationRow = Database['public']['Tables']['incident_escalations']['Row'];

interface ScopedIncidentEscalationInput {
  tenantId: string;
  incidentId: string;
}

export async function getIncidentEscalationFromDb(
  supabase: SupabaseClient<Database>,
  input: ScopedIncidentEscalationInput & {
    escalationId: string;
  },
) {
  const { data, error } = await supabase
    .from('incident_escalations')
    .select('*')
    .eq('organization_id', input.tenantId)
    .eq('incident_id', input.incidentId)
    .eq('id', input.escalationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listIncidentEscalationsFromDb(
  supabase: SupabaseClient<Database>,
  input: ScopedIncidentEscalationInput,
): Promise<IncidentEscalationEntry[]> {
  const { data, error } = await supabase
    .from('incident_escalations')
    .select('*')
    .eq('organization_id', input.tenantId)
    .eq('incident_id', input.incidentId)
    .order('triggered_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const profileLabels = await loadProfileLabelMap(
    supabase,
    data.flatMap((row) =>
      [row.triggered_by_user_id, row.acknowledged_by_user_id, row.target_user_id].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );

  return data.map((row) => mapIncidentEscalationEntry(row, profileLabels));
}

export async function createIncidentEscalationInDb(
  supabase: SupabaseClient<Database>,
  input: ScopedIncidentEscalationInput & {
    escalationLevel: number;
    reason: string | null;
    targetUserId: string | null;
    targetRole: Database['public']['Enums']['organization_role'] | null;
    targetQueue: string | null;
    triggeredByUserId: string;
  },
) {
  const { data: incident, error: incidentError } = await supabase
    .from('incidents')
    .select('id, title, reference, location_id, escalation_level')
    .eq('organization_id', input.tenantId)
    .eq('id', input.incidentId)
    .maybeSingle();

  if (incidentError) {
    throw new Error(incidentError.message);
  }

  if (!incident) {
    return null;
  }

  const nextEscalationLevel = Math.max(incident.escalation_level, input.escalationLevel);
  const targetQueue =
    input.targetQueue && input.targetQueue.trim().length > 0 ? input.targetQueue.trim() : null;

  const { data: inserted, error: insertError } = await supabase
    .from('incident_escalations')
    .insert({
      organization_id: input.tenantId,
      location_id: incident.location_id,
      incident_id: input.incidentId,
      triggered_by_user_id: input.triggeredByUserId,
      escalation_level: input.escalationLevel,
      reason: input.reason,
      target_user_id: input.targetUserId,
      target_role: input.targetRole,
      target_queue: targetQueue,
      status: 'sent',
    })
    .select('*')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  if (nextEscalationLevel !== incident.escalation_level) {
    const { error: updateError } = await supabase
      .from('incidents')
      .update({
        escalation_level: nextEscalationLevel,
      })
      .eq('organization_id', input.tenantId)
      .eq('id', input.incidentId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return {
    incidentId: incident.id,
    incidentTitle: incident.title,
    incidentReference: incident.reference,
    locationId: incident.location_id,
    escalation: inserted,
    escalationLevel: nextEscalationLevel,
  };
}

export async function acknowledgeIncidentEscalationInDb(
  supabase: SupabaseClient<Database>,
  input: ScopedIncidentEscalationInput & {
    escalationId: string;
    viewerId: string;
  },
) {
  const current = await getIncidentEscalationFromDb(supabase, input);

  if (!current) {
    return null;
  }

  if (current.status === 'acknowledged' || current.status === 'completed') {
    return {
      changed: false as const,
      escalation: current,
    };
  }

  const { data: updated, error: updateError } = await supabase
    .from('incident_escalations')
    .update({
      status: 'acknowledged',
      acknowledged_by_user_id: input.viewerId,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('organization_id', input.tenantId)
    .eq('incident_id', input.incidentId)
    .eq('id', input.escalationId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    changed: true as const,
    escalation: updated,
  };
}

export async function completeOpenIncidentEscalationsInDb(
  supabase: SupabaseClient<Database>,
  input: ScopedIncidentEscalationInput,
) {
  const { data: rows, error: selectError } = await supabase
    .from('incident_escalations')
    .select('id')
    .eq('organization_id', input.tenantId)
    .eq('incident_id', input.incidentId)
    .in('status', ['pending', 'sent', 'acknowledged']);

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (rows.length === 0) {
    return 0;
  }

  const { error: updateError } = await supabase
    .from('incident_escalations')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('organization_id', input.tenantId)
    .eq('incident_id', input.incidentId)
    .in(
      'id',
      rows.map((row) => row.id),
    );

  if (updateError) {
    throw new Error(updateError.message);
  }

  return rows.length;
}

function mapIncidentEscalationEntry(
  row: IncidentEscalationRow,
  profileLabels: Map<string, string>,
): IncidentEscalationEntry {
  const targetLabel = formatIncidentEscalationTargetLabel(row, profileLabels);

  return {
    id: row.id,
    escalationLevel: row.escalation_level,
    status: row.status,
    reason: row.reason,
    targetLabel,
    targetUserId: row.target_user_id,
    triggeredByName: row.triggered_by_user_id
      ? (profileLabels.get(row.triggered_by_user_id) ?? 'Unknown teammate')
      : 'System',
    acknowledgedByName: row.acknowledged_by_user_id
      ? (profileLabels.get(row.acknowledged_by_user_id) ?? 'Unknown teammate')
      : null,
    triggeredAtLabel: formatDateTimeLabel(row.triggered_at),
    acknowledgedAtLabel: row.acknowledged_at
      ? formatDateTimeLabel(row.acknowledged_at)
      : null,
    completedAtLabel: row.completed_at ? formatDateTimeLabel(row.completed_at) : null,
  };
}

export function formatIncidentEscalationTargetLabel(
  row: Pick<IncidentEscalationRow, 'target_user_id' | 'target_role' | 'target_queue'>,
  profileLabels?: Map<string, string>,
) {
  if (row.target_user_id) {
    return profileLabels?.get(row.target_user_id) ?? 'Unknown teammate';
  }

  if (row.target_role) {
    return `${formatTokenLabel(row.target_role)} role`;
  }

  if (row.target_queue) {
    return row.target_queue;
  }

  return 'Unspecified target';
}
