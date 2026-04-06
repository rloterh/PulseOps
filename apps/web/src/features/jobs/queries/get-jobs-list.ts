import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getJobsListFromDb } from '@/features/jobs/repositories/jobs.repository';
import type { JobListFilters } from '@/features/jobs/types/job.types';

export async function getJobsList(input: {
  tenantId: string;
  branchId: string | null;
  filters: JobListFilters;
}) {
  const supabase = await createSupabaseServerClient();
  return getJobsListFromDb(supabase, input);
}
