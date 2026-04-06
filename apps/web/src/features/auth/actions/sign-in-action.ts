'use server';

import { getClientEnvResult } from '@pulseops/env/client';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { redirect } from 'next/navigation';
import { getSafeNextPath } from '@/lib/auth/get-safe-next-path';
import type { AuthActionState } from '../types';
import { signInSchema } from '../schemas/sign-in-schema';

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Invalid sign-in details.',
    };
  }

  if (!getClientEnvResult().success) {
    return {
      error:
        'Supabase auth is not configured yet. Add your local environment values before signing in.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect(getSafeNextPath(parsed.data.next));
}
