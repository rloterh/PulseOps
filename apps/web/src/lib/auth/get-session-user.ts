import 'server-only';

import { getClientEnvResult } from '@pulseops/env/client';
import { createSupabaseServerClient } from '@pulseops/supabase/server';

export async function getSessionUser() {
  if (!getClientEnvResult().success) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
