'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import {
  ACTIVE_BRANCH_COOKIE_MAX_AGE_SECONDS,
  ACTIVE_BRANCH_COOKIE_NAME,
} from '@/lib/tenancy/active-branch-preference';
import { createJobSchema } from '@/features/jobs/schemas/create-job.schema';
import { createJob } from '@/features/jobs/lib/create-job';
import type { CreateJobActionState } from '@/features/jobs/types/job.types';

const initialError = 'Provide valid job details before submitting.';

export async function createJobAction(
  _previousState: CreateJobActionState,
  formData: FormData,
): Promise<CreateJobActionState> {
  const parsed = createJobSchema.safeParse({
    locationId: formData.get('locationId'),
    title: formData.get('title'),
    summary: formData.get('summary'),
    customerName: formData.get('customerName'),
    priority: formData.get('priority'),
    type: formData.get('type'),
    dueAt: formData.get('dueAt'),
    assigneeUserId: formData.get('assigneeUserId'),
    checklistSummary: formData.get('checklistSummary'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? initialError,
    };
  }

  const context = await requireTenantMember();
  const result = await createJob(parsed.data, context);

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
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${result.jobId}`);
  redirect(`/jobs/${result.jobId}`);
}
