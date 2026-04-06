'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getCollaborationTargetFromDb } from '@/features/collaboration/repositories/collaboration.repository';
import { canCreateIncidents } from '@/features/incidents/lib/incident-permissions';
import { updateIncidentStatusInDb } from '@/features/incidents/repositories/incidents.repository';
import {
  bulkUpdateIncidentStatusSchema,
  parseBulkIncidentIds,
} from '@/features/incidents/schemas/bulk-incident-action.schemas';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { createBulkActionFeedback } from '@/features/operations-list/lib/bulk-action-feedback';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';

export interface BulkIncidentStatusActionState {
  error?: string;
  success?: string;
}

export async function bulkUpdateIncidentStatusAction(
  _prevState: BulkIncidentStatusActionState,
  formData: FormData,
): Promise<BulkIncidentStatusActionState> {
  const parsed = bulkUpdateIncidentStatusSchema.safeParse({
    incidentIdsPayload: formData.get('incidentIdsPayload'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return {
      error: 'Select at least one incident and a valid status.',
    };
  }

  const incidentIds = parseBulkIncidentIds(parsed.data.incidentIdsPayload);
  const selectedCount = incidentIds?.length ?? 0;

  if (!incidentIds) {
    return {
      error: 'The selected incidents could not be processed.',
    };
  }

  const context = await requireTenantMember();

  if (!canCreateIncidents(context.membershipRole)) {
    return {
      error: 'You do not have permission to bulk update incidents.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  let updatedCount = 0;

  for (const incidentId of incidentIds) {
    const updated = await updateIncidentStatusInDb(supabase, {
      tenantId: context.tenantId,
      branchId: context.branchId,
      incidentId,
      status: parsed.data.status,
    });

    if (!updated?.changed) {
      continue;
    }

    updatedCount += 1;

    const target = await getCollaborationTargetFromDb(supabase, {
      tenantId: context.tenantId,
      entityType: 'incident',
      entityId: incidentId,
    });

    await insertTimelineEvent(supabase, {
      kind: 'incident',
      tenantId: context.tenantId,
      parentId: incidentId,
      eventType: parsed.data.status === 'resolved' ? 'resolution' : 'status_change',
      title:
        parsed.data.status === 'resolved'
          ? 'Incident resolved'
          : 'Incident status updated',
      description: `Status: ${formatTokenLabel(updated.previousStatus)} -> ${formatTokenLabel(parsed.data.status)}.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });

    if (target) {
      await createRecordNotifications({
        supabase: admin,
        target,
        actorUserId: context.viewerId,
        eventType: 'status_change',
        title: `${target.reference} status changed`,
        body: `${context.viewerName} moved ${target.title} to ${formatTokenLabel(parsed.data.status)}.`,
      });
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/incidents');
  revalidatePath('/inbox');

  return createBulkActionFeedback({
    resourceLabel: 'incident',
    selectedCount,
    updatedCount,
    statusLabel: formatTokenLabel(parsed.data.status),
  });
}
