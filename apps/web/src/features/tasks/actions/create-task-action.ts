'use server';

import type { Route } from 'next';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import {
  ACTIVE_BRANCH_COOKIE_MAX_AGE_SECONDS,
  ACTIVE_BRANCH_COOKIE_NAME,
} from '@/lib/tenancy/active-branch-preference';
import { createTaskSchema } from '@/features/tasks/schemas/create-task.schema';
import { createTask } from '@/features/tasks/lib/create-task';
import type { CreateTaskActionState } from '@/features/tasks/types/task.types';

const initialError = 'Provide valid task details before submitting.';

export async function createTaskAction(
  _previousState: CreateTaskActionState,
  formData: FormData,
): Promise<CreateTaskActionState> {
  const parsed = createTaskSchema.safeParse({
    locationId: formData.get('locationId'),
    title: formData.get('title'),
    summary: formData.get('summary'),
    priority: formData.get('priority'),
    dueAt: formData.get('dueAt'),
    assigneeUserId: formData.get('assigneeUserId'),
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

  if (
    await isServerActionRateLimited({
      bucket: 'task:create',
      actorId: context.viewerId,
      limit: 50,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many task submissions. Please wait a moment and try again.',
    };
  }

  const result = await createTask(parsed.data, context);

  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_BRANCH_COOKIE_NAME, result.locationId, {
    sameSite: 'lax',
    path: '/',
    httpOnly: false,
    maxAge: ACTIVE_BRANCH_COOKIE_MAX_AGE_SECONDS,
  });

  revalidatePath('/dashboard');
  revalidatePath('/tasks');
  revalidatePath(`/tasks/${result.taskId}`);
  redirect(`/tasks/${result.taskId}` as Route);
}
