'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { updateTaskStatusInDb } from '@/features/tasks/repositories/tasks.repository';
import { updateTaskStatusSchema } from '@/features/tasks/schemas/task-mutation.schemas';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';

export async function updateTaskStatusAction(formData: FormData) {
  const parsed = updateTaskStatusSchema.safeParse({
    taskId: formData.get('taskId'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();
  const updated = await updateTaskStatusInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    taskId: parsed.data.taskId,
    status: parsed.data.status,
  });

  if (!updated) {
    return;
  }

  if (updated.changed) {
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

    revalidatePath('/dashboard');
    revalidatePath('/tasks');
    revalidatePath(`/tasks/${parsed.data.taskId}`);
  }
}
