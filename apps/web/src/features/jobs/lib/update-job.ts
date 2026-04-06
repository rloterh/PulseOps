import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import type { Database } from '@pulseops/supabase/types';
import { describeFieldChanges } from '@/lib/records/describe-field-changes';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';

interface UpdateJobContext {
  viewerId: string;
  viewerName: string;
  tenantId: string;
  membershipRole: Database['public']['Enums']['organization_role'];
}

interface UpdateJobInput {
  jobId: string;
  title: string;
  summary: string;
  customerName: string;
  priority: Database['public']['Enums']['job_priority'];
  type: Database['public']['Enums']['job_type'];
  dueAt: string | null;
  checklistSummary: string;
  resolutionSummary: string;
}

function canEditJobs(role: Database['public']['Enums']['organization_role']) {
  return ['owner', 'admin', 'manager'].includes(role);
}

export async function updateJob(
  input: UpdateJobInput,
  context: UpdateJobContext,
): Promise<
  | { ok: false; error: string }
  | { ok: true; jobId: string; changed: boolean }
> {
  if (!canEditJobs(context.membershipRole)) {
    return {
      ok: false,
      error: 'You do not have permission to edit jobs for this workspace.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: current, error: currentError } = await supabase
    .from('jobs')
    .select(
      'id, title, summary, customer_name, priority, type, due_at, checklist_summary, resolution_summary',
    )
    .eq('organization_id', context.tenantId)
    .eq('id', input.jobId)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!current) {
    return {
      ok: false,
      error: 'This job is no longer available.',
    };
  }

  const changeDescription = describeFieldChanges([
    { label: 'Title', before: current.title, after: input.title },
    { label: 'Summary', before: current.summary, after: input.summary },
    { label: 'Customer', before: current.customer_name, after: input.customerName },
    {
      label: 'Priority',
      before: formatTokenLabel(current.priority),
      after: formatTokenLabel(input.priority),
    },
    {
      label: 'Type',
      before: formatTokenLabel(current.type),
      after: formatTokenLabel(input.type),
    },
    {
      label: 'Due at',
      before: current.due_at ? formatDateTimeLabel(current.due_at) : null,
      after: input.dueAt ? formatDateTimeLabel(input.dueAt) : null,
    },
    {
      label: 'Checklist summary',
      before: current.checklist_summary,
      after: input.checklistSummary,
    },
    {
      label: 'Resolution summary',
      before: current.resolution_summary,
      after: input.resolutionSummary,
    },
  ]);

  if (!changeDescription) {
    return {
      ok: true,
      jobId: current.id,
      changed: false,
    };
  }

  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      title: input.title,
      summary: input.summary,
      customer_name: input.customerName,
      priority: input.priority,
      type: input.type,
      due_at: input.dueAt,
      checklist_summary: input.checklistSummary,
      resolution_summary: input.resolutionSummary || null,
    })
    .eq('organization_id', context.tenantId)
    .eq('id', input.jobId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await insertTimelineEvent(supabase, {
    kind: 'job',
    tenantId: context.tenantId,
    parentId: input.jobId,
    eventType: 'note',
    title: 'Job details updated',
    description: changeDescription,
    actorUserId: context.viewerId,
    actorName: context.viewerName,
  });

  return {
    ok: true,
    jobId: input.jobId,
    changed: true,
  };
}
