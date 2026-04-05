import { NextResponse, type NextRequest } from 'next/server';
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

  const response = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(request, response);

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
