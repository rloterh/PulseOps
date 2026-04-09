'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getCollaborationTargetFromDb } from '@/features/collaboration/repositories/collaboration.repository';
import { canCreateJobs } from '@/features/jobs/lib/jobs-permissions';
import { updateJobStatusInDb } from '@/features/jobs/repositories/jobs.repository';
import { updateJobStatusSchema } from '@/features/jobs/schemas/job-mutation.schemas';
import type { CreateJobActionState } from '@/features/jobs/types/job.types';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

const invalidStatusError = 'Choose a valid job status before saving.';

export async function updateJobStatusAction(
  _previousState: CreateJobActionState,
  formData: FormData,
): Promise<CreateJobActionState> {
  const parsed = updateJobStatusSchema.safeParse({
    jobId: formData.get('jobId'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? invalidStatusError,
    };
  }

  const context = await requireTenantMember();

  if (!canCreateJobs(context.membershipRole)) {
    return {
      error: 'You do not have permission to update jobs in this workspace.',
    };
  }

  if (
    await isServerActionRateLimited({
      bucket: 'job:status',
      actorId: context.viewerId,
      limit: 60,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many job status updates. Please wait a moment and try again.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const updated = await updateJobStatusInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    jobId: parsed.data.jobId,
    status: parsed.data.status,
  });

  if (!updated) {
    return {
      error: 'This job is no longer available in the selected branch.',
    };
  }

  if (updated.changed) {
    const target = await getCollaborationTargetFromDb(supabase, {
      tenantId: context.tenantId,
      entityType: 'job',
      entityId: parsed.data.jobId,
    });

    await insertTimelineEvent(supabase, {
      kind: 'job',
      tenantId: context.tenantId,
      parentId: parsed.data.jobId,
      eventType: parsed.data.status === 'completed' ? 'completed' : 'status_change',
      title: parsed.data.status === 'completed' ? 'Job completed' : 'Job status updated',
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
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${parsed.data.jobId}`);
  }

  return {};
}
