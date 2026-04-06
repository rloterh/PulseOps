import { NextResponse, type NextRequest } from 'next/server';
import { getClientEnvResult } from '@pulseops/env/client';
import { createSupabaseMiddlewareClient } from '@pulseops/supabase/middleware';

const sessionRefreshExclusions = [
  '/api/health',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

function shouldSkipSessionRefresh(pathname: string) {
  return sessionRefreshExclusions.some((path) => pathname === path);
}

export async function proxy(request: NextRequest) {
  if (shouldSkipSessionRefresh(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const envResult = getClientEnvResult();

  if (!envResult.success) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'PulseOps is missing required public environment variables for Supabase session refresh.',
      );
    }

    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(
    request,
    response,
    envResult.data,
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
