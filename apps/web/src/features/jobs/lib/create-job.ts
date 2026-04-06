import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { getAssignableUserById } from '@/features/directory/queries/get-assignable-user-by-id';
import type { CreateJobInput } from '@/features/jobs/schemas/create-job.schema';
import { canCreateJobs } from './jobs-permissions';
import type { Database } from '@pulseops/supabase/types';

interface CreateJobContext {
  viewerId: string;
  viewerName: string;
  tenantId: string;
  membershipRole: Database['public']['Enums']['organization_role'];
}

export async function createJob(
  input: CreateJobInput,
  context: CreateJobContext,
): Promise<
  | { ok: false; error: string }
  | { ok: true; jobId: string; locationId: string }
> {
  if (!canCreateJobs(context.membershipRole)) {
    return {
      ok: false,
      error: 'You do not have permission to create jobs for this workspace.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('id, name')
    .eq('organization_id', context.tenantId)
    .eq('id', input.locationId)
    .eq('is_active', true)
    .maybeSingle();

  if (locationError) {
    throw new Error(locationError.message);
  }

  if (!location) {
    return {
      ok: false,
      error: 'Selected branch is no longer available.',
    };
  }

  const assignee = input.assigneeUserId
    ? await getAssignableUserById({
        organizationId: context.tenantId,
        locationId: location.id,
        userId: input.assigneeUserId,
      })
    : null;

  if (input.assigneeUserId && !assignee) {
    return {
      ok: false,
      error: 'Selected assignee is no longer available for this branch.',
    };
  }

  const { data: reference, error: referenceError } = await supabase.rpc(
    'next_job_reference',
    {
      target_org_id: context.tenantId,
    },
  );

  if (referenceError) {
    throw new Error(referenceError.message);
  }

  const { data: job, error: insertError } = await supabase
    .from('jobs')
    .insert({
      organization_id: context.tenantId,
      location_id: location.id,
      incident_id: null,
      reference,
      title: input.title,
      summary: input.summary,
      site_name: location.name,
      customer_name: input.customerName,
      priority: input.priority,
      status: 'new',
      type: input.type,
      due_at: input.dueAt,
      created_by_user_id: context.viewerId,
      assignee_user_id: assignee?.userId ?? null,
      checklist_summary: input.checklistSummary,
      resolution_summary: null,
    })
    .select('id, title, reference, location_id')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  await insertTimelineEvent(supabase, {
    kind: 'job',
    tenantId: context.tenantId,
    parentId: job.id,
    eventType: 'created',
    title: 'Job created',
    description: assignee
      ? `${job.reference} was created for ${location.name} and assigned to ${assignee.fullName}.`
      : `${job.reference} was created for ${location.name}.`,
    actorUserId: context.viewerId,
    actorName: context.viewerName,
  });

  if (assignee) {
    await insertTimelineEvent(supabase, {
      kind: 'job',
      tenantId: context.tenantId,
      parentId: job.id,
      eventType: 'assignment',
      title: 'Assignee added during intake',
      description: `${assignee.fullName} was assigned when the job was created.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });
  }

  return {
    ok: true,
    jobId: job.id,
    locationId: job.location_id,
  };
}
