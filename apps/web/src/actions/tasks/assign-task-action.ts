'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import {
  ensureRecordWatchersInDb,
  getCollaborationTargetFromDb,
} from '@/features/collaboration/repositories/collaboration.repository';
import {
  assignTaskInDb,
  getTaskMutationTargetFromDb,
} from '@/features/tasks/repositories/tasks.repository';
import { assignTaskSchema } from '@/features/tasks/schemas/task-mutation.schemas';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
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

export async function assignTaskAction(formData: FormData) {
  const rawAssignee = formData.get('assigneeUserId');
  const assigneeUserId =
    typeof rawAssignee === 'string' && rawAssignee.length > 0 ? rawAssignee : null;
  const parsed = assignTaskSchema.safeParse({
    taskId: formData.get('taskId'),
    assigneeUserId,
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();
  const current = await getTaskMutationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    taskId: parsed.data.taskId,
  });

  if (!current) {
    return;
  }

  const assignees = await getMemberOptions(context.tenantId, current.location_id);

  if (!isMemberSelectionAllowed(assignees, parsed.data.assigneeUserId)) {
    return;
  }

  const updated = await assignTaskInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    taskId: parsed.data.taskId,
    assigneeUserId: parsed.data.assigneeUserId,
  });

  if (!updated) {
    return;
  }

  if (updated.changed) {
    const target = await getCollaborationTargetFromDb(supabase, {
      tenantId: context.tenantId,
      entityType: 'task',
      entityId: parsed.data.taskId,
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
      kind: 'task',
      tenantId: context.tenantId,
      parentId: parsed.data.taskId,
      eventType: 'assignment',
      title: parsed.data.assigneeUserId ? 'Task assigned' : 'Task unassigned',
      description: `Assignee: ${previousLabel} -> ${nextLabel}.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
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
    revalidatePath('/tasks');
    revalidatePath(`/tasks/${parsed.data.taskId}`);
  }
}
