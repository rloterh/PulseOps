import { NextResponse } from 'next/server';
import { getClientEnvResult } from '@pulseops/env/client';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getPostAuthRedirectPath } from '@/lib/auth/get-post-auth-redirect-path';
import { getSafeNextPath } from '@/lib/auth/get-safe-next-path';

function getVerifyUrl(url: URL, status: 'invalid-link' | 'missing-config') {
  const verifyUrl = new URL('/verify', url);

  verifyUrl.searchParams.set('status', status);
  return verifyUrl;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = getSafeNextPath(url.searchParams.get('next'));
  const code = url.searchParams.get('code');
  const envResult = getClientEnvResult();

  if (!envResult.success || !code) {
    return NextResponse.redirect(
      getVerifyUrl(url, !envResult.success ? 'missing-config' : 'invalid-link'),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(getVerifyUrl(url, 'invalid-link'));
  }

  return NextResponse.redirect(
    new URL(
      await getPostAuthRedirectPath({
        userId: data.user.id,
        next: nextPath,
      }),
      url,
    ),
  );
}
