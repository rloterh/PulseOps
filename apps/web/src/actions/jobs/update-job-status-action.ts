'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { updateJobStatusInDb } from '@/features/jobs/repositories/jobs.repository';
import { updateJobStatusSchema } from '@/features/jobs/schemas/job-mutation.schemas';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

export async function updateJobStatusAction(formData: FormData) {
  const parsed = updateJobStatusSchema.safeParse({
    jobId: formData.get('jobId'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();
  const updated = await updateJobStatusInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    jobId: parsed.data.jobId,
    status: parsed.data.status,
  });

  if (!updated) {
    return;
  }

  if (updated.changed) {
    await insertTimelineEvent(supabase, {
      kind: 'job',
      tenantId: context.tenantId,
      parentId: parsed.data.jobId,
      eventType: parsed.data.status === 'completed' ? 'completed' : 'status_change',
      title: parsed.data.status === 'completed' ? 'Job completed' : 'Job status updated',
      description:
        parsed.data.status === 'completed'
          ? `${updated.title} was marked as completed.`
          : `${updated.title} moved to ${parsed.data.status.replaceAll('_', ' ')}.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });

    revalidatePath('/dashboard');
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${parsed.data.jobId}`);
  }

  return;
}
