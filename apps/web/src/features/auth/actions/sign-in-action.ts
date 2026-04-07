'use server';

import { getClientEnvResult } from '@pulseops/env/client';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { redirect } from 'next/navigation';
import { getPostAuthRedirectPath } from '@/lib/auth/get-post-auth-redirect-path';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
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

  if (
    await isServerActionRateLimited({
      bucket: 'auth:sign-in',
      actorId: parsed.data.email,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many sign-in attempts. Please wait a moment and try again.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect(
    await getPostAuthRedirectPath({
      userId: data.user.id,
      next: parsed.data.next,
    }),
  );
}
