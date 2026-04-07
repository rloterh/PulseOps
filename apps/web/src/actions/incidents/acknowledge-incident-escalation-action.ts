'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { insertAuditLogInDb } from '@/features/audit/repositories/audit.repository';
import { getCollaborationTargetFromDb } from '@/features/collaboration/repositories/collaboration.repository';
import { canAcknowledgeIncidentEscalation } from '@/features/incidents/lib/incident-escalation-permissions';
import {
  acknowledgeIncidentEscalationInDb,
  formatIncidentEscalationTargetLabel,
  getIncidentEscalationFromDb,
} from '@/features/incidents/repositories/incident-escalations.repository';
import { syncIncidentSlaState } from '@/features/incidents/lib/sync-incident-sla';
import { getIncidentMutationTargetFromDb } from '@/features/incidents/repositories/incidents.repository';
import { acknowledgeIncidentEscalationSchema } from '@/features/incidents/schemas/incident-mutation.schemas';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

function buildProfileLabelMap(
  members: Awaited<ReturnType<typeof getMemberOptions>>,
): Map<string, string> {
  return new Map(members.map((member) => [member.id, member.label]));
}

export async function acknowledgeIncidentEscalationAction(formData: FormData) {
  const parsed = acknowledgeIncidentEscalationSchema.safeParse({
    incidentId: formData.get('incidentId'),
    escalationId: formData.get('escalationId'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();

  if (
    await isServerActionRateLimited({
      bucket: 'incident:escalation-ack',
      actorId: context.viewerId,
      limit: 60,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const [incident, currentEscalation] = await Promise.all([
    getIncidentMutationTargetFromDb(supabase, {
      tenantId: context.tenantId,
      branchId: context.branchId,
      incidentId: parsed.data.incidentId,
    }),
    getIncidentEscalationFromDb(supabase, {
      tenantId: context.tenantId,
      incidentId: parsed.data.incidentId,
      escalationId: parsed.data.escalationId,
    }),
  ]);

  if (!incident || !currentEscalation) {
    return;
  }

  if (
    !canAcknowledgeIncidentEscalation({
      role: context.membershipRole,
      viewerId: context.viewerId,
      targetUserId: currentEscalation.target_user_id,
    })
  ) {
    return;
  }

  const acknowledged = await acknowledgeIncidentEscalationInDb(supabase, {
    tenantId: context.tenantId,
    incidentId: parsed.data.incidentId,
    escalationId: parsed.data.escalationId,
    viewerId: context.viewerId,
  });

  if (!acknowledged?.changed) {
    return;
  }

  const syncedSnapshot = await syncIncidentSlaState(supabase, {
    tenantId: context.tenantId,
    incidentId: parsed.data.incidentId,
  });

  const members = await getMemberOptions(context.tenantId, incident.location_id);
  const targetLabel = formatIncidentEscalationTargetLabel(
    acknowledged.escalation,
    buildProfileLabelMap(members),
  );
  const target = await getCollaborationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    entityType: 'incident',
    entityId: parsed.data.incidentId,
  });

  await insertTimelineEvent(supabase, {
    kind: 'incident',
    tenantId: context.tenantId,
    parentId: parsed.data.incidentId,
    eventType: 'escalation',
    title: 'Escalation acknowledged',
    description: `${context.viewerName} acknowledged escalation level ${String(acknowledged.escalation.escalation_level)} for ${targetLabel}.`,
    actorUserId: context.viewerId,
    actorName: context.viewerName,
  });

  await insertAuditLogInDb(supabase, {
    tenantId: context.tenantId,
    locationId: incident.location_id,
    actorUserId: context.viewerId,
    action: 'incident.escalation_acknowledged',
    entityType: 'incident',
    entityId: parsed.data.incidentId,
    entityLabel: incident.title,
    scope: 'incident',
    metadata: {
      escalationId: acknowledged.escalation.id,
      escalationLevel: acknowledged.escalation.escalation_level,
      targetLabel,
      slaRisk: syncedSnapshot?.risk_level ?? null,
      escalationState: syncedSnapshot?.escalation_state ?? null,
    },
  });

  if (target) {
    await createRecordNotifications({
      supabase: createSupabaseAdminClient(),
      target,
      actorUserId: context.viewerId,
      eventType: 'escalation',
      title: `${target.reference} escalation acknowledged`,
      body: `${context.viewerName} acknowledged escalation level ${String(acknowledged.escalation.escalation_level)}.`,
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/incidents');
  revalidatePath(`/incidents/${parsed.data.incidentId}`);
  revalidatePath('/admin/activity');
  revalidatePath('/inbox');
}
