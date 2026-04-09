import { getSiteUrl } from '@/lib/site/get-site-url';

export function buildEmailRedirectUrl(next = '/dashboard') {
  const callbackUrl = new URL('/callback', getSiteUrl());

  callbackUrl.searchParams.set('next', next);
  return callbackUrl.toString();
}
