import 'server-only';

import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getTaskDetailFromDb } from '@/features/tasks/repositories/tasks.repository';

export async function getTaskById(input: {
  tenantId: string;
  branchId: string | null;
  taskId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const task = await getTaskDetailFromDb(supabase, input);

  if (!task) {
    notFound();
  }

  return task;
}
