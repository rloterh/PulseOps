import { NextResponse } from 'next/server';
import { getClientEnvResult } from '@pulseops/env/client';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getSafeNextPath } from '@/lib/auth/get-safe-next-path';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = getSafeNextPath(url.searchParams.get('next'));
  const verifyUrl = new URL('/verify', url);
  const code = url.searchParams.get('code');

  if (!getClientEnvResult().success || !code) {
    return NextResponse.redirect(verifyUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(verifyUrl);
  }

  return NextResponse.redirect(new URL(nextPath, url));
}
