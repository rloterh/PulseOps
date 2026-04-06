import 'server-only';

import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getJobDetailFromDb } from '@/features/jobs/repositories/jobs.repository';

export async function getJobById(input: {
  tenantId: string;
  branchId: string | null;
  jobId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const job = await getJobDetailFromDb(supabase, input);

  if (!job) {
    notFound();
  }

  return job;
}
