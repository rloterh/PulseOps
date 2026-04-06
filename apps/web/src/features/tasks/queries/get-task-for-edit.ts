import 'server-only';

import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { loadLocationNameMap } from '@/lib/data/load-label-maps';
import type { TaskEditRecord } from '@/features/tasks/types/task.types';

export async function getTaskForEdit(input: {
  tenantId: string;
  branchId: string | null;
  taskId: string;
}) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('tasks')
    .select(
      'id, location_id, title, summary, priority, due_at, completion_summary, linked_incident_id, linked_job_id',
    )
    .eq('organization_id', input.tenantId)
    .eq('id', input.taskId);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const locationNames = await loadLocationNameMap(supabase, [data.location_id]);

  const task: TaskEditRecord = {
    id: data.id,
    branchId: data.location_id,
    branchName: locationNames.get(data.location_id) ?? 'Unknown branch',
    title: data.title,
    summary: data.summary,
    priority: data.priority,
    dueAt: data.due_at,
    completionSummary: data.completion_summary ?? '',
    linkedEntityKind: data.linked_incident_id
      ? 'incident'
      : data.linked_job_id
        ? 'job'
        : 'none',
    linkedEntityId: data.linked_incident_id ?? data.linked_job_id,
  };

  return task;
}
