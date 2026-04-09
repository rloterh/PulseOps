'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getCollaborationTargetFromDb } from '@/features/collaboration/repositories/collaboration.repository';
import { canCreateTasks } from '@/features/tasks/lib/task-permissions';
import { updateTaskStatusInDb } from '@/features/tasks/repositories/tasks.repository';
import { updateTaskStatusSchema } from '@/features/tasks/schemas/task-mutation.schemas';
import type { CreateTaskActionState } from '@/features/tasks/types/task.types';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

const invalidStatusError = 'Choose a valid task status before saving.';

export async function updateTaskStatusAction(
  _previousState: CreateTaskActionState,
  formData: FormData,
): Promise<CreateTaskActionState> {
  const parsed = updateTaskStatusSchema.safeParse({
    taskId: formData.get('taskId'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? invalidStatusError,
    };
  }

  const context = await requireTenantMember();

  if (!canCreateTasks(context.membershipRole)) {
    return {
      error: 'You do not have permission to update tasks in this workspace.',
    };
  }

  if (
    await isServerActionRateLimited({
      bucket: 'task:status',
      actorId: context.viewerId,
      limit: 60,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many task status updates. Please wait a moment and try again.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const updated = await updateTaskStatusInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    taskId: parsed.data.taskId,
    status: parsed.data.status,
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

    await insertTimelineEvent(supabase, {
      kind: 'task',
      tenantId: context.tenantId,
      parentId: parsed.data.taskId,
      eventType: parsed.data.status === 'completed' ? 'completed' : 'status_change',
      title: parsed.data.status === 'completed' ? 'Task completed' : 'Task status updated',
      description: `Status: ${formatTokenLabel(updated.previousStatus)} -> ${formatTokenLabel(parsed.data.status)}.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
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
    revalidatePath('/tasks');
    revalidatePath(`/tasks/${parsed.data.taskId}`);
  }

  return {};
}
