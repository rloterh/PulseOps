'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { insertAuditLogInDb } from '@/features/audit/repositories/audit.repository';
import { getCollaborationTargetFromDb } from '@/features/collaboration/repositories/collaboration.repository';
import { canManageIncidentEscalations } from '@/features/incidents/lib/incident-escalation-permissions';
import {
  createIncidentEscalationInDb,
  formatIncidentEscalationTargetLabel,
} from '@/features/incidents/repositories/incident-escalations.repository';
import { syncIncidentSlaState } from '@/features/incidents/lib/sync-incident-sla';
import { getIncidentMutationTargetFromDb } from '@/features/incidents/repositories/incidents.repository';
import { createIncidentEscalationSchema } from '@/features/incidents/schemas/incident-mutation.schemas';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { isMemberSelectionAllowed } from '@/lib/organizations/member-selection';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

function buildProfileLabelMap(
  members: Awaited<ReturnType<typeof getMemberOptions>>,
): Map<string, string> {
  return new Map(members.map((member) => [member.id, member.label]));
}

export async function createIncidentEscalationAction(formData: FormData) {
  const parsed = createIncidentEscalationSchema.safeParse({
    incidentId: formData.get('incidentId'),
    escalationLevel: formData.get('escalationLevel'),
    reason: formData.get('reason'),
    targetUserId: formData.get('targetUserId'),
    targetRole: formData.get('targetRole'),
    targetQueue: formData.get('targetQueue'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();

  if (
    await isServerActionRateLimited({
      bucket: 'incident:escalation',
      actorId: context.viewerId,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return;
  }

  if (!canManageIncidentEscalations(context.membershipRole)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const current = await getIncidentMutationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId: parsed.data.incidentId,
  });

  if (!current) {
    return;
  }

  const members = await getMemberOptions(context.tenantId, current.location_id);
  const normalizedTargetRole =
    parsed.data.targetRole && parsed.data.targetRole.length > 0
      ? parsed.data.targetRole
      : null;

  if (!isMemberSelectionAllowed(members, parsed.data.targetUserId)) {
    return;
  }

  const created = await createIncidentEscalationInDb(supabase, {
    tenantId: context.tenantId,
    incidentId: parsed.data.incidentId,
    escalationLevel: parsed.data.escalationLevel,
    reason: parsed.data.reason || null,
    targetUserId: parsed.data.targetUserId,
    targetRole: normalizedTargetRole,
    targetQueue:
      parsed.data.targetQueue.length > 0 ? parsed.data.targetQueue : null,
    triggeredByUserId: context.viewerId,
  });

  if (!created) {
    return;
  }

  const syncedSnapshot = await syncIncidentSlaState(supabase, {
    tenantId: context.tenantId,
    incidentId: parsed.data.incidentId,
  });

  const targetLabel = formatIncidentEscalationTargetLabel(
    created.escalation,
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
    title: `Escalated to ${targetLabel}`,
    description: parsed.data.reason
      ? `Escalation level ${String(parsed.data.escalationLevel)} sent to ${targetLabel}. Reason: ${parsed.data.reason}`
      : `Escalation level ${String(parsed.data.escalationLevel)} sent to ${targetLabel}.`,
    actorUserId: context.viewerId,
    actorName: context.viewerName,
  });

  await insertAuditLogInDb(supabase, {
    tenantId: context.tenantId,
    locationId: created.locationId,
    actorUserId: context.viewerId,
    action: 'incident.escalation_triggered',
    entityType: 'incident',
    entityId: created.incidentId,
    entityLabel: created.incidentTitle,
    scope: 'incident',
    metadata: {
      escalationLevel: parsed.data.escalationLevel,
      targetLabel,
      targetUserId: parsed.data.targetUserId,
      targetRole: normalizedTargetRole,
      targetQueue: parsed.data.targetQueue || null,
      reason: parsed.data.reason || null,
      slaRisk: syncedSnapshot?.risk_level ?? null,
      escalationState: syncedSnapshot?.escalation_state ?? null,
    },
  });

  if (target) {
    const recipientUserIds = Array.from(
      new Set([
        ...(parsed.data.targetUserId ? [parsed.data.targetUserId] : []),
        ...members
          .filter((member) => member.role === normalizedTargetRole)
          .map((member) => member.id),
      ]),
    );

    await createRecordNotifications({
      supabase: createSupabaseAdminClient(),
      target,
      actorUserId: context.viewerId,
      eventType: 'escalation',
      title: `${target.reference} escalated`,
      body: `${context.viewerName} escalated ${target.title} to ${targetLabel}.`,
      recipientUserIds,
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/incidents');
  revalidatePath(`/incidents/${parsed.data.incidentId}`);
  revalidatePath('/admin/activity');
  revalidatePath('/inbox');
}
