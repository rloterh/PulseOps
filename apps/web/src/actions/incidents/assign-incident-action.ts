'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import {
  ensureRecordWatchersInDb,
  getCollaborationTargetFromDb,
} from '@/features/collaboration/repositories/collaboration.repository';
import {
  assignIncidentInDb,
  getIncidentMutationTargetFromDb,
} from '@/features/incidents/repositories/incidents.repository';
import { assignIncidentSchema } from '@/features/incidents/schemas/incident-mutation.schemas';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { isMemberSelectionAllowed } from '@/lib/organizations/member-selection';

function getMemberLabel(
  members: Awaited<ReturnType<typeof getMemberOptions>>,
  userId: string | null,
) {
  if (!userId) {
    return 'Unassigned';
  }

  return members.find((member) => member.id === userId)?.label ?? 'Unknown assignee';
}

export async function assignIncidentAction(formData: FormData) {
  const rawAssignee = formData.get('assigneeUserId');
  const assigneeUserId =
    typeof rawAssignee === 'string' && rawAssignee.length > 0 ? rawAssignee : null;
  const parsed = assignIncidentSchema.safeParse({
    incidentId: formData.get('incidentId'),
    assigneeUserId,
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();
  const current = await getIncidentMutationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId: parsed.data.incidentId,
  });

  if (!current) {
    return;
  }

  const assignees = await getMemberOptions(context.tenantId, current.location_id);

  if (!isMemberSelectionAllowed(assignees, parsed.data.assigneeUserId)) {
    return;
  }

  const updated = await assignIncidentInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId: parsed.data.incidentId,
    assigneeUserId: parsed.data.assigneeUserId,
  });

  if (!updated) {
    return;
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

    revalidatePath('/dashboard');
    revalidatePath('/incidents');
    revalidatePath(`/incidents/${parsed.data.incidentId}`);
  }

  return;
}
