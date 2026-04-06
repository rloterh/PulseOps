import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import type { Database } from '@pulseops/supabase/types';
import { describeFieldChanges } from '@/lib/records/describe-field-changes';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';

interface UpdateTaskContext {
  viewerId: string;
  viewerName: string;
  tenantId: string;
  membershipRole: Database['public']['Enums']['organization_role'];
}

interface UpdateTaskInput {
  taskId: string;
  title: string;
  summary: string;
  priority: Database['public']['Enums']['job_priority'];
  dueAt: string | null;
  linkedEntityKind: 'none' | 'incident' | 'job';
  linkedEntityId: string | null;
  completionSummary: string;
}

function canEditTasks(role: Database['public']['Enums']['organization_role']) {
  return ['owner', 'admin', 'manager', 'agent'].includes(role);
}

export async function updateTask(
  input: UpdateTaskInput,
  context: UpdateTaskContext,
): Promise<
  | { ok: false; error: string }
  | { ok: true; taskId: string; changed: boolean }
> {
  if (!canEditTasks(context.membershipRole)) {
    return {
      ok: false,
      error: 'You do not have permission to edit tasks for this workspace.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: current, error: currentError } = await supabase
    .from('tasks')
    .select(
      'id, location_id, title, summary, priority, due_at, completion_summary, linked_incident_id, linked_job_id',
    )
    .eq('organization_id', context.tenantId)
    .eq('id', input.taskId)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!current) {
    return {
      ok: false,
      error: 'This task is no longer available.',
    };
  }

  let linkedIncidentId: string | null = null;
  let linkedJobId: string | null = null;
  let linkedLabel: string | null = null;
  let currentLinkedLabel: string | null = null;

  if (current.linked_incident_id) {
    const { data: incidentRef, error: incidentRefError } = await supabase
      .from('incidents')
      .select('reference')
      .eq('organization_id', context.tenantId)
      .eq('id', current.linked_incident_id)
      .maybeSingle();

    if (incidentRefError) {
      throw new Error(incidentRefError.message);
    }

    currentLinkedLabel = incidentRef?.reference ?? 'Linked incident';
  }

  if (current.linked_job_id) {
    const { data: jobRef, error: jobRefError } = await supabase
      .from('jobs')
      .select('reference')
      .eq('organization_id', context.tenantId)
      .eq('id', current.linked_job_id)
      .maybeSingle();

    if (jobRefError) {
      throw new Error(jobRefError.message);
    }

    currentLinkedLabel = jobRef?.reference ?? 'Linked job';
  }

  if (input.linkedEntityKind === 'incident' && input.linkedEntityId) {
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .select('id, reference')
      .eq('organization_id', context.tenantId)
      .eq('location_id', current.location_id)
      .eq('id', input.linkedEntityId)
      .maybeSingle();

    if (incidentError) {
      throw new Error(incidentError.message);
    }

    if (!incident) {
      return {
        ok: false,
        error: 'Choose an incident that belongs to this task branch.',
      };
    }

    linkedIncidentId = incident.id;
    linkedLabel = incident.reference;
  }

  if (input.linkedEntityKind === 'job' && input.linkedEntityId) {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, reference')
      .eq('organization_id', context.tenantId)
      .eq('location_id', current.location_id)
      .eq('id', input.linkedEntityId)
      .maybeSingle();

    if (jobError) {
      throw new Error(jobError.message);
    }

    if (!job) {
      return {
        ok: false,
        error: 'Choose a job that belongs to this task branch.',
      };
    }

    linkedJobId = job.id;
    linkedLabel = job.reference;
  }

  const nextLinkedLabel = input.linkedEntityKind === 'none' ? null : linkedLabel;

  const changeDescription = describeFieldChanges([
    { label: 'Title', before: current.title, after: input.title },
    { label: 'Summary', before: current.summary, after: input.summary },
    {
      label: 'Priority',
      before: formatTokenLabel(current.priority),
      after: formatTokenLabel(input.priority),
    },
    {
      label: 'Due at',
      before: current.due_at ? formatDateTimeLabel(current.due_at) : null,
      after: input.dueAt ? formatDateTimeLabel(input.dueAt) : null,
    },
    {
      label: 'Linked record',
      before: currentLinkedLabel,
      after: nextLinkedLabel,
    },
    {
      label: 'Completion note',
      before: current.completion_summary,
      after: input.completionSummary,
    },
  ]);

  if (!changeDescription) {
    return {
      ok: true,
      taskId: current.id,
      changed: false,
    };
  }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      title: input.title,
      summary: input.summary,
      priority: input.priority,
      due_at: input.dueAt,
      linked_incident_id: linkedIncidentId,
      linked_job_id: linkedJobId,
      completion_summary: input.completionSummary || null,
    })
    .eq('organization_id', context.tenantId)
    .eq('id', input.taskId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await insertTimelineEvent(supabase, {
    kind: 'task',
    tenantId: context.tenantId,
    parentId: input.taskId,
    eventType: 'note',
    title: 'Task details updated',
    description: changeDescription,
    actorUserId: context.viewerId,
    actorName: context.viewerName,
  });

  return {
    ok: true,
    taskId: input.taskId,
    changed: true,
  };
}
