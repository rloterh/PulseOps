import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getTasksListFromDb } from '@/features/tasks/repositories/tasks.repository';

export async function getTasksList(input: {
  tenantId: string;
  branchId: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  return getTasksListFromDb(supabase, input);
}
