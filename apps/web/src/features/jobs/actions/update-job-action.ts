'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { updateJobSchema } from '@/features/jobs/schemas/job-mutation.schemas';
import { updateJob } from '@/features/jobs/lib/update-job';
import type { CreateJobActionState } from '@/features/jobs/types/job.types';

const initialError = 'Provide valid job details before saving.';

export async function updateJobAction(
  _previousState: CreateJobActionState,
  formData: FormData,
): Promise<CreateJobActionState> {
  const parsed = updateJobSchema.safeParse({
    jobId: formData.get('jobId'),
    title: formData.get('title'),
    summary: formData.get('summary'),
    customerName: formData.get('customerName'),
    priority: formData.get('priority'),
    type: formData.get('type'),
    dueAt: formData.get('dueAt'),
    checklistSummary: formData.get('checklistSummary'),
    resolutionSummary: formData.get('resolutionSummary'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? initialError,
    };
  }

  const context = await requireTenantMember();
  const result = await updateJob(parsed.data, context);

  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  revalidatePath('/dashboard');
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${result.jobId}`);
  redirect(`/jobs/${result.jobId}`);
}
