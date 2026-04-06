import 'server-only';

import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { loadLocationNameMap } from '@/lib/data/load-label-maps';
import type { JobEditRecord } from '@/features/jobs/types/job.types';

export async function getJobForEdit(input: {
  tenantId: string;
  branchId: string | null;
  jobId: string;
}) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('jobs')
    .select(
      'id, location_id, title, summary, customer_name, priority, type, due_at, checklist_summary, resolution_summary',
    )
    .eq('organization_id', input.tenantId)
    .eq('id', input.jobId);

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

  const job: JobEditRecord = {
    id: data.id,
    branchId: data.location_id,
    branchName: locationNames.get(data.location_id) ?? 'Unknown branch',
    title: data.title,
    summary: data.summary,
    customerName: data.customer_name,
    priority: data.priority,
    type: data.type,
    dueAt: data.due_at,
    checklistSummary: data.checklist_summary,
    resolutionSummary: data.resolution_summary ?? '',
  };

  return job;
}
