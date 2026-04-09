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
import { canCreateTasks } from '@/features/tasks/lib/task-permissions';
import { assignTaskSchema } from '@/features/tasks/schemas/task-mutation.schemas';
import type { CreateTaskActionState } from '@/features/tasks/types/task.types';
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

export async function assignTaskAction(
  _previousState: CreateTaskActionState,
  formData: FormData,
): Promise<CreateTaskActionState> {
  const rawAssignee = formData.get('assigneeUserId');
  const assigneeUserId =
    typeof rawAssignee === 'string' && rawAssignee.length > 0 ? rawAssignee : null;
  const parsed = assignTaskSchema.safeParse({
    taskId: formData.get('taskId'),
    assigneeUserId,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? invalidAssigneeError,
    };
  }

  const context = await requireTenantMember();

  if (!canCreateTasks(context.membershipRole)) {
    return {
      error: 'You do not have permission to assign tasks in this workspace.',
    };
  }

  if (
    await isServerActionRateLimited({
      bucket: 'task:assignment',
      actorId: context.viewerId,
      limit: 60,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many task assignment updates. Please wait a moment and try again.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const current = await getTaskMutationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    taskId: parsed.data.taskId,
  });

  if (!current) {
    return {
      error: 'This task is no longer available in the selected branch.',
    };
  }

  const assignees = await getMemberOptions(context.tenantId, current.location_id);

  if (!isMemberSelectionAllowed(assignees, parsed.data.assigneeUserId)) {
    return {
      error: 'Selected assignee is no longer available for this branch.',
    };
  }

  const updated = await assignTaskInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    taskId: parsed.data.taskId,
    assigneeUserId: parsed.data.assigneeUserId,
  });

  if (!updated) {
    return {
      error: 'This task is no longer available in the selected branch.',
    };
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

  return {};
}
