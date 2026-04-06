'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { assignJobInDb } from '@/features/jobs/repositories/jobs.repository';
import { assignJobSchema } from '@/features/jobs/schemas/job-mutation.schemas';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

export async function assignJobAction(formData: FormData) {
  const rawAssignee = formData.get('assigneeUserId');
  const assigneeUserId =
    typeof rawAssignee === 'string' && rawAssignee.length > 0 ? rawAssignee : null;
  const parsed = assignJobSchema.safeParse({
    jobId: formData.get('jobId'),
    assigneeUserId,
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();
  const updated = await assignJobInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    jobId: parsed.data.jobId,
    assigneeUserId: parsed.data.assigneeUserId,
  });

  if (!updated) {
    return;
  }

  if (updated.changed) {
    await insertTimelineEvent(supabase, {
      kind: 'job',
      tenantId: context.tenantId,
      parentId: parsed.data.jobId,
      eventType: 'assignment',
      title: parsed.data.assigneeUserId ? 'Job assigned' : 'Job unassigned',
      description: parsed.data.assigneeUserId
        ? `${updated.title} assignment was updated.`
        : `${updated.title} no longer has an assignee.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });

    revalidatePath('/dashboard');
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${parsed.data.jobId}`);
  }

  return;
}
