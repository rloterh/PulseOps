'use server';

import { revalidatePath } from 'next/cache';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { updateTaskSchema } from '@/features/tasks/schemas/task-mutation.schemas';
import { updateTask } from '@/features/tasks/lib/update-task';
import type { CreateTaskActionState } from '@/features/tasks/types/task.types';

const initialError = 'Provide valid task details before saving.';

export async function updateTaskAction(
  _previousState: CreateTaskActionState,
  formData: FormData,
): Promise<CreateTaskActionState> {
  const parsed = updateTaskSchema.safeParse({
    taskId: formData.get('taskId'),
    title: formData.get('title'),
    summary: formData.get('summary'),
    priority: formData.get('priority'),
    dueAt: formData.get('dueAt'),
    linkedEntityKind: formData.get('linkedEntityKind'),
    linkedEntityId: formData.get('linkedEntityId'),
    completionSummary: formData.get('completionSummary'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? initialError,
    };
  }

  const context = await requireTenantMember();
  const result = await updateTask(parsed.data, context);

  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  revalidatePath('/dashboard');
  revalidatePath('/tasks');
  revalidatePath(`/tasks/${result.taskId}`);
  redirect(`/tasks/${result.taskId}` as Route);
}
