'use server';

import { getClientEnvResult } from '@pulseops/env/client';
import { getServerEnv } from '@pulseops/env/server';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { redirect } from 'next/navigation';
import { getPostAuthRedirectPath } from '@/lib/auth/get-post-auth-redirect-path';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import type { AuthActionState } from '../types';
import { signUpSchema } from '../schemas/sign-up-schema';

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Invalid account details.',
    };
  }

  if (!getClientEnvResult().success) {
    return {
      error:
        'Supabase auth is not configured yet. Add your local environment values before creating an account.',
    };
  }

  if (
    await isServerActionRateLimited({
      bucket: 'auth:sign-up',
      actorId: parsed.data.email,
      limit: 5,
      windowMs: 30 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many sign-up attempts. Please wait a moment and try again.',
    };
  }

  const env = getServerEnv();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/callback?next=/dashboard`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (!data.session) {
    return {
      success: 'Check your email to confirm your account, then continue to PulseOps.',
    };
  }

  if (!data.user) {
    return {
      error:
        'Your account was created, but PulseOps could not resolve the signed-in user. Try signing in again.',
    };
  }

  redirect(
    await getPostAuthRedirectPath({
      userId: data.user.id,
      next: '/onboarding',
    }),
  );
}
