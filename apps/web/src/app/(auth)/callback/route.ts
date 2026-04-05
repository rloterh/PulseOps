import { NextResponse } from 'next/server';

function resolveSafeRedirect(nextParam: string | null) {
  if (!nextParam?.startsWith('/')) {
    return '/';
  }

  return nextParam;
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const nextParam = url.searchParams.get('next');

  return NextResponse.redirect(new URL(resolveSafeRedirect(nextParam), url));
}
