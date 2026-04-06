import 'server-only';

import type { Database } from '@pulseops/supabase/types';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getAssignableUserById } from '@/features/directory/queries/get-assignable-user-by-id';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import type { CreateTaskInput } from '@/features/tasks/schemas/create-task.schema';
import { canCreateTasks } from './task-permissions';

interface CreateTaskContext {
  viewerId: string;
  viewerName: string;
  tenantId: string;
  membershipRole: Database['public']['Enums']['organization_role'];
}

export async function createTask(
  input: CreateTaskInput,
  context: CreateTaskContext,
): Promise<
  | { ok: false; error: string }
  | { ok: true; taskId: string; locationId: string }
> {
  if (!canCreateTasks(context.membershipRole)) {
    return {
      ok: false,
      error: 'You do not have permission to create tasks for this workspace.',
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

  let linkedIncidentId: string | null = null;
  let linkedJobId: string | null = null;
  let linkedReference: string | null = null;

  if (input.linkedEntityKind === 'incident' && input.linkedEntityId) {
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .select('id, reference')
      .eq('organization_id', context.tenantId)
      .eq('location_id', location.id)
      .eq('id', input.linkedEntityId)
      .maybeSingle();

    if (incidentError) {
      throw new Error(incidentError.message);
    }

    if (!incident) {
      return {
        ok: false,
        error: 'Choose an incident that belongs to the selected branch.',
      };
    }

    linkedIncidentId = incident.id;
    linkedReference = incident.reference;
  }

  if (input.linkedEntityKind === 'job' && input.linkedEntityId) {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, reference')
      .eq('organization_id', context.tenantId)
      .eq('location_id', location.id)
      .eq('id', input.linkedEntityId)
      .maybeSingle();

    if (jobError) {
      throw new Error(jobError.message);
    }

    if (!job) {
      return {
        ok: false,
        error: 'Choose a job that belongs to the selected branch.',
      };
    }

    linkedJobId = job.id;
    linkedReference = job.reference;
  }

  const { data: reference, error: referenceError } = await supabase.rpc(
    'next_task_reference',
    {
      target_org_id: context.tenantId,
    },
  );

  if (referenceError) {
    throw new Error(referenceError.message);
  }

  const { data: task, error: insertError } = await supabase
    .from('tasks')
    .insert({
      organization_id: context.tenantId,
      location_id: location.id,
      linked_incident_id: linkedIncidentId,
      linked_job_id: linkedJobId,
      reference,
      title: input.title,
      summary: input.summary,
      priority: input.priority,
      status: 'todo',
      due_at: input.dueAt,
      created_by_user_id: context.viewerId,
      assignee_user_id: assignee?.userId ?? null,
      completion_summary: input.completionSummary || null,
    })
    .select('id, title, reference, location_id')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  await insertTimelineEvent(supabase, {
    kind: 'task',
    tenantId: context.tenantId,
    parentId: task.id,
    eventType: 'created',
    title: 'Task created',
    description: linkedReference
      ? `${task.reference} was created for ${location.name} and linked to ${linkedReference}.`
      : `${task.reference} was created for ${location.name}.`,
    actorUserId: context.viewerId,
    actorName: context.viewerName,
  });

  if (assignee) {
    await insertTimelineEvent(supabase, {
      kind: 'task',
      tenantId: context.tenantId,
      parentId: task.id,
      eventType: 'assignment',
      title: 'Assignee added during intake',
      description: `${assignee.fullName} was assigned when the task was created.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });
  }

  return {
    ok: true,
    taskId: task.id,
    locationId: task.location_id,
  };
}
