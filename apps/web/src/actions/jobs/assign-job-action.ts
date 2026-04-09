'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import {
  ensureRecordWatchersInDb,
  getCollaborationTargetFromDb,
} from '@/features/collaboration/repositories/collaboration.repository';
import { canCreateJobs } from '@/features/jobs/lib/jobs-permissions';
import {
  assignJobInDb,
  getJobMutationTargetFromDb,
} from '@/features/jobs/repositories/jobs.repository';
import { assignJobSchema } from '@/features/jobs/schemas/job-mutation.schemas';
import type { CreateJobActionState } from '@/features/jobs/types/job.types';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { isMemberSelectionAllowed } from '@/lib/organizations/member-selection';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

function getMemberLabel(
  members: Awaited<ReturnType<typeof getMemberOptions>>,
  userId: string | null,
) {
  if (!userId) {
    return 'Unassigned';
  }

  return members.find((member) => member.id === userId)?.label ?? 'Unknown assignee';
}

const invalidAssigneeError = 'Choose a valid assignee before saving.';

export async function assignJobAction(
  _previousState: CreateJobActionState,
  formData: FormData,
): Promise<CreateJobActionState> {
  const rawAssignee = formData.get('assigneeUserId');
  const assigneeUserId =
    typeof rawAssignee === 'string' && rawAssignee.length > 0 ? rawAssignee : null;
  const parsed = assignJobSchema.safeParse({
    jobId: formData.get('jobId'),
    assigneeUserId,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? invalidAssigneeError,
    };
  }

  const context = await requireTenantMember();

  if (!canCreateJobs(context.membershipRole)) {
    return {
      error: 'You do not have permission to assign jobs in this workspace.',
    };
  }

  if (
    await isServerActionRateLimited({
      bucket: 'job:assignment',
      actorId: context.viewerId,
      limit: 60,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many job assignment updates. Please wait a moment and try again.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const current = await getJobMutationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    jobId: parsed.data.jobId,
  });

  if (!current) {
    return {
      error: 'This job is no longer available in the selected branch.',
    };
  }

  const assignees = await getMemberOptions(context.tenantId, current.location_id);

  if (!isMemberSelectionAllowed(assignees, parsed.data.assigneeUserId)) {
    return {
      error: 'Selected assignee is no longer available for this branch.',
    };
  }

  const updated = await assignJobInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    jobId: parsed.data.jobId,
    assigneeUserId: parsed.data.assigneeUserId,
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
    const previousLabel = getMemberLabel(assignees, updated.previousAssigneeUserId);
    const nextLabel = getMemberLabel(assignees, updated.assignee_user_id);

    if (target && updated.assignee_user_id) {
      await ensureRecordWatchersInDb(supabase, {
        target,
        watchers: [
          {
            userId: updated.assignee_user_id,
            source: 'assignee',
          },
        ],
      });
    }

    await insertTimelineEvent(supabase, {
      kind: 'job',
      tenantId: context.tenantId,
      parentId: parsed.data.jobId,
      eventType: 'assignment',
      title: parsed.data.assigneeUserId ? 'Job assigned' : 'Job unassigned',
      description: `Assignee: ${previousLabel} -> ${nextLabel}.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });

    if (target) {
      await createRecordNotifications({
        supabase: createSupabaseAdminClient(),
        target,
        actorUserId: context.viewerId,
        eventType: 'assignment',
        title: `${target.reference} assignment updated`,
        body: `${context.viewerName} changed the assignee from ${previousLabel} to ${nextLabel}.`,
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${parsed.data.jobId}`);
  }

  return {};
}
