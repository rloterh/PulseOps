'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getCollaborationTargetFromDb } from '@/features/collaboration/repositories/collaboration.repository';
import { insertAuditLogInDb } from '@/features/audit/repositories/audit.repository';
import { completeOpenIncidentEscalationsInDb } from '@/features/incidents/repositories/incident-escalations.repository';
import { updateIncidentStatusInDb } from '@/features/incidents/repositories/incidents.repository';
import { updateIncidentStatusSchema } from '@/features/incidents/schemas/incident-mutation.schemas';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { syncIncidentSlaState } from '@/features/incidents/lib/sync-incident-sla';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

export async function updateIncidentStatusAction(formData: FormData) {
  const parsed = updateIncidentStatusSchema.safeParse({
    incidentId: formData.get('incidentId'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();

  if (
    await isServerActionRateLimited({
      bucket: 'incident:status',
      actorId: context.viewerId,
      limit: 60,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const updated = await updateIncidentStatusInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId: parsed.data.incidentId,
    status: parsed.data.status,
  });

  if (!updated) {
    return;
  }

  if (updated.changed) {
    const completedEscalationCount =
      parsed.data.status === 'resolved' || parsed.data.status === 'closed'
        ? await completeOpenIncidentEscalationsInDb(supabase, {
            tenantId: context.tenantId,
            incidentId: parsed.data.incidentId,
          })
        : 0;
    const syncedSnapshot = await syncIncidentSlaState(supabase, {
      tenantId: context.tenantId,
      incidentId: parsed.data.incidentId,
    });
    const target = await getCollaborationTargetFromDb(supabase, {
      tenantId: context.tenantId,
      entityType: 'incident',
      entityId: parsed.data.incidentId,
    });

    await insertTimelineEvent(supabase, {
      kind: 'incident',
      tenantId: context.tenantId,
      parentId: parsed.data.incidentId,
      eventType: parsed.data.status === 'resolved' ? 'resolution' : 'status_change',
      title:
        parsed.data.status === 'resolved'
          ? 'Incident resolved'
          : 'Incident status updated',
      description: `Status: ${formatTokenLabel(updated.previousStatus)} -> ${formatTokenLabel(parsed.data.status)}.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });

    await insertAuditLogInDb(supabase, {
      tenantId: context.tenantId,
      locationId: updated.location_id,
      actorUserId: context.viewerId,
      action: 'incident.status_changed',
      entityType: 'incident',
      entityId: parsed.data.incidentId,
      entityLabel: updated.title,
      scope: 'incident',
      metadata: {
        fromStatus: updated.previousStatus,
        toStatus: parsed.data.status,
        completedEscalationCount,
        slaRisk: syncedSnapshot?.risk_level ?? null,
        escalationState: syncedSnapshot?.escalation_state ?? null,
      },
    });

    if (target) {
      await createRecordNotifications({
        supabase: createSupabaseAdminClient(),
        target,
        actorUserId: context.viewerId,
        eventType: 'status_change',
        title: `${target.reference} status changed`,
        body: `${context.viewerName} moved ${target.title} to ${formatTokenLabel(parsed.data.status)}.`,
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/incidents');
    revalidatePath(`/incidents/${parsed.data.incidentId}`);
    revalidatePath('/admin/activity');
    revalidatePath('/inbox');
  }

  return;
}
