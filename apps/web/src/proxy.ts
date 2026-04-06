import { NextResponse, type NextRequest } from 'next/server';
import { getClientEnvResult } from '@pulseops/env/client';
import { createSupabaseMiddlewareClient } from '@pulseops/supabase/middleware';
import { isAuthRoute, isProtectedRoute } from '@/lib/auth/route-access';

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
  const { pathname, search } = request.nextUrl;

  if (shouldSkipSessionRefresh(pathname)) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedRoute(pathname)) {
    const signInUrl = new URL('/sign-in', request.url);

    signInUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (user && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
