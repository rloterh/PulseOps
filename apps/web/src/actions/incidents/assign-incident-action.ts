'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import {
  ensureRecordWatchersInDb,
  getCollaborationTargetFromDb,
} from '@/features/collaboration/repositories/collaboration.repository';
import { insertAuditLogInDb } from '@/features/audit/repositories/audit.repository';
import {
  assignIncidentInDb,
  getIncidentMutationTargetFromDb,
} from '@/features/incidents/repositories/incidents.repository';
import { canCreateIncidents } from '@/features/incidents/lib/incident-permissions';
import { assignIncidentSchema } from '@/features/incidents/schemas/incident-mutation.schemas';
import type { CreateIncidentActionState } from '@/features/incidents/types/incident.types';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { isMemberSelectionAllowed } from '@/lib/organizations/member-selection';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

function getMemberLabel(
  members: Awaited<ReturnType<typeof getMemberOptions>>,
  userId: string | null,
) {
  if (!userId) {
    return 'Unassigned';
  }

  return members.find((member) => member.id === userId)?.label ?? 'Unknown assignee';
}

const invalidAssigneeError = 'Choose a valid assignee before saving.';

export async function assignIncidentAction(
  _previousState: CreateIncidentActionState,
  formData: FormData,
): Promise<CreateIncidentActionState> {
  const rawAssignee = formData.get('assigneeUserId');
  const assigneeUserId =
    typeof rawAssignee === 'string' && rawAssignee.length > 0 ? rawAssignee : null;
  const parsed = assignIncidentSchema.safeParse({
    incidentId: formData.get('incidentId'),
    assigneeUserId,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? invalidAssigneeError,
    };
  }

  const context = await requireTenantMember();

  if (!canCreateIncidents(context.membershipRole)) {
    return {
      error: 'You do not have permission to assign incidents in this workspace.',
    };
  }

  if (
    await isServerActionRateLimited({
      bucket: 'incident:assignment',
      actorId: context.viewerId,
      limit: 60,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many incident assignment updates. Please wait a moment and try again.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const current = await getIncidentMutationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId: parsed.data.incidentId,
  });

  if (!current) {
    return {
      error: 'This incident is no longer available in the selected branch.',
    };
  }

  const assignees = await getMemberOptions(context.tenantId, current.location_id);

  if (!isMemberSelectionAllowed(assignees, parsed.data.assigneeUserId)) {
    return {
      error: 'Selected assignee is no longer available for this branch.',
    };
  }

  const updated = await assignIncidentInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId: parsed.data.incidentId,
    assigneeUserId: parsed.data.assigneeUserId,
  });

  if (!updated) {
    return {
      error: 'This incident is no longer available in the selected branch.',
    };
  }

  if (updated.changed) {
    const target = await getCollaborationTargetFromDb(supabase, {
      tenantId: context.tenantId,
      entityType: 'incident',
      entityId: parsed.data.incidentId,
    });
    const previousLabel = getMemberLabel(assignees, updated.previousAssigneeUserId);
    const nextLabel = getMemberLabel(assignees, updated.assignee_user_id);

    if (target && updated.assignee_user_id) {
      await ensureRecordWatchersInDb(supabase, {
        target,
        watchers: [
          {
            userId: updated.assignee_user_id,
            source: 'assignee',
          },
        ],
      });
    }

    await insertTimelineEvent(supabase, {
      kind: 'incident',
      tenantId: context.tenantId,
      parentId: parsed.data.incidentId,
      eventType: 'assignment',
      title: parsed.data.assigneeUserId ? 'Incident assigned' : 'Incident unassigned',
      description: `Assignee: ${previousLabel} -> ${nextLabel}.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });

    await insertAuditLogInDb(supabase, {
      tenantId: context.tenantId,
      locationId: updated.location_id,
      actorUserId: context.viewerId,
      action: 'incident.assignee_changed',
      entityType: 'incident',
      entityId: parsed.data.incidentId,
      entityLabel: updated.title,
      scope: 'incident',
      metadata: {
        fromAssignee: previousLabel,
        toAssignee: nextLabel,
        fromAssigneeUserId: updated.previousAssigneeUserId,
        toAssigneeUserId: updated.assignee_user_id,
      },
    });

    if (target) {
      await createRecordNotifications({
        supabase: createSupabaseAdminClient(),
        target,
        actorUserId: context.viewerId,
        eventType: 'assignment',
        title: `${target.reference} assignment updated`,
        body: `${context.viewerName} changed the assignee from ${previousLabel} to ${nextLabel}.`,
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/incidents');
    revalidatePath(`/incidents/${parsed.data.incidentId}`);
    revalidatePath('/admin/activity');
    revalidatePath('/inbox');
  }

  return {};
}
