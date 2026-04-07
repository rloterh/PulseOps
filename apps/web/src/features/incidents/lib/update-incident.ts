import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { insertAuditLogInDb } from '@/features/audit/repositories/audit.repository';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import type { Database } from '@pulseops/supabase/types';
import { describeFieldChanges } from '@/lib/records/describe-field-changes';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { syncIncidentSlaState } from './sync-incident-sla';

interface UpdateIncidentContext {
  viewerId: string;
  viewerName: string;
  tenantId: string;
  membershipRole: Database['public']['Enums']['organization_role'];
}

interface UpdateIncidentInput {
  incidentId: string;
  title: string;
  summary: string;
  customerName: string;
  severity: Database['public']['Enums']['incident_severity'];
  reportedAt: string | null;
  slaRisk: boolean;
  impactSummary: string;
  nextAction: string;
}

function canEditIncidents(role: Database['public']['Enums']['organization_role']) {
  return ['owner', 'admin', 'manager', 'agent'].includes(role);
}

export async function updateIncident(
  input: UpdateIncidentInput,
  context: UpdateIncidentContext,
): Promise<
  | { ok: false; error: string }
  | { ok: true; incidentId: string; changed: boolean }
> {
  if (!canEditIncidents(context.membershipRole)) {
    return {
      ok: false,
      error: 'You do not have permission to edit incidents for this workspace.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: current, error: currentError } = await supabase
    .from('incidents')
    .select(
      'id, title, summary, customer_name, severity, opened_at, sla_risk, impact_summary, next_action',
    )
    .eq('organization_id', context.tenantId)
    .eq('id', input.incidentId)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!current) {
    return {
      ok: false,
      error: 'This incident is no longer available.',
    };
  }

  const changeDescription = describeFieldChanges([
    { label: 'Title', before: current.title, after: input.title },
    { label: 'Summary', before: current.summary, after: input.summary },
    { label: 'Customer', before: current.customer_name, after: input.customerName },
    {
      label: 'Severity',
      before: formatTokenLabel(current.severity),
      after: formatTokenLabel(input.severity),
    },
    {
      label: 'Reported at',
      before: formatDateTimeLabel(current.opened_at),
      after: input.reportedAt ? formatDateTimeLabel(input.reportedAt) : null,
    },
    {
      label: 'SLA risk',
      before: current.sla_risk ? 'At risk' : 'Healthy',
      after: input.slaRisk ? 'At risk' : 'Healthy',
    },
    {
      label: 'Impact summary',
      before: current.impact_summary,
      after: input.impactSummary,
    },
    {
      label: 'Next action',
      before: current.next_action,
      after: input.nextAction,
    },
  ]);

  if (!changeDescription) {
    return {
      ok: true,
      incidentId: current.id,
      changed: false,
    };
  }

  const { error: updateError } = await supabase
    .from('incidents')
    .update({
      title: input.title,
      summary: input.summary,
      customer_name: input.customerName,
      severity: input.severity,
      opened_at: input.reportedAt ?? current.opened_at,
      sla_risk: input.slaRisk,
      impact_summary: input.impactSummary,
      next_action: input.nextAction,
    })
    .eq('organization_id', context.tenantId)
    .eq('id', input.incidentId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const syncedSnapshot = await syncIncidentSlaState(supabase, {
    tenantId: context.tenantId,
    incidentId: input.incidentId,
  });

  await insertTimelineEvent(supabase, {
    kind: 'incident',
    tenantId: context.tenantId,
    parentId: input.incidentId,
    eventType: 'note',
    title: 'Incident details updated',
    description: changeDescription,
    actorUserId: context.viewerId,
    actorName: context.viewerName,
  });

  await insertAuditLogInDb(supabase, {
    tenantId: context.tenantId,
    actorUserId: context.viewerId,
    action: 'incident.updated',
    entityType: 'incident',
    entityId: input.incidentId,
    entityLabel: input.title,
    scope: 'incident',
    metadata: {
      severity: input.severity,
      slaRisk: syncedSnapshot?.risk_level ?? null,
      statusCategory: syncedSnapshot?.status_category ?? null,
    },
  });

  return {
    ok: true,
    incidentId: input.incidentId,
    changed: true,
  };
}
