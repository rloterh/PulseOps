'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getCollaborationTargetFromDb } from '@/features/collaboration/repositories/collaboration.repository';
import { canCreateJobs } from '@/features/jobs/lib/jobs-permissions';
import { updateJobStatusInDb } from '@/features/jobs/repositories/jobs.repository';
import {
  bulkUpdateJobStatusSchema,
  parseBulkJobIds,
} from '@/features/jobs/schemas/bulk-job-action.schemas';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { createBulkActionFeedback } from '@/features/operations-list/lib/bulk-action-feedback';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

export interface BulkJobStatusActionState {
  error?: string;
  success?: string;
}

export async function bulkUpdateJobStatusAction(
  _prevState: BulkJobStatusActionState,
  formData: FormData,
): Promise<BulkJobStatusActionState> {
  const parsed = bulkUpdateJobStatusSchema.safeParse({
    jobIdsPayload: formData.get('jobIdsPayload'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return {
      error: 'Select at least one job and a valid status.',
    };
  }

  const jobIds = parseBulkJobIds(parsed.data.jobIdsPayload);
  const selectedCount = jobIds?.length ?? 0;

  if (!jobIds) {
    return {
      error: 'The selected jobs could not be processed.',
    };
  }

  const context = await requireTenantMember();

  if (
    await isServerActionRateLimited({
      bucket: 'job:bulk-status',
      actorId: context.viewerId,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many bulk job updates. Please wait a moment and try again.',
    };
  }

  if (!canCreateJobs(context.membershipRole)) {
    return {
      error: 'You do not have permission to bulk update jobs.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  let updatedCount = 0;

  for (const jobId of jobIds) {
    const updated = await updateJobStatusInDb(supabase, {
      tenantId: context.tenantId,
      branchId: context.branchId,
      jobId,
      status: parsed.data.status,
    });

    if (!updated?.changed) {
      continue;
    }

    updatedCount += 1;

    const target = await getCollaborationTargetFromDb(supabase, {
      tenantId: context.tenantId,
      entityType: 'job',
      entityId: jobId,
    });

    await insertTimelineEvent(supabase, {
      kind: 'job',
      tenantId: context.tenantId,
      parentId: jobId,
      eventType: parsed.data.status === 'completed' ? 'completed' : 'status_change',
      title: parsed.data.status === 'completed' ? 'Job completed' : 'Job status updated',
      description: `Status: ${formatTokenLabel(updated.previousStatus)} -> ${formatTokenLabel(parsed.data.status)}.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });

    if (target) {
      await createRecordNotifications({
        supabase: admin,
        target,
        actorUserId: context.viewerId,
        eventType: 'status_change',
        title: `${target.reference} status changed`,
        body: `${context.viewerName} moved ${target.title} to ${formatTokenLabel(parsed.data.status)}.`,
      });
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/jobs');
  revalidatePath('/inbox');

  return createBulkActionFeedback({
    resourceLabel: 'job',
    selectedCount,
    updatedCount,
    statusLabel: formatTokenLabel(parsed.data.status),
  });
}
