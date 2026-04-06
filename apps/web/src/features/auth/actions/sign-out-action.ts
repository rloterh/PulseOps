'use server';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { redirect } from 'next/navigation';

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect('/sign-in');
}
