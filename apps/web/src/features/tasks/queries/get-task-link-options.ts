import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getTaskLinkOptionsFromDb } from '@/features/tasks/repositories/tasks.repository';

export async function getTaskLinkOptions(input: { tenantId: string }) {
  const supabase = await createSupabaseServerClient();
  return getTaskLinkOptionsFromDb(supabase, input);
}
