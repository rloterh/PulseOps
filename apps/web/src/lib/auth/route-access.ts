export const publicRoutes = [
  '/',
  '/pricing',
  '/docs',
  '/blog',
  '/help',
  '/screenshots',
  '/compare',
  '/solutions',
  '/templates',
  '/contact',
  '/sign-in',
  '/sign-up',
  '/verify',
  '/callback',
  '/portal',
] as const;

export const authRoutes = ['/sign-in', '/sign-up', '/verify', '/callback'] as const;

export const protectedRoutePrefixes = [
  '/onboarding',
  '/admin',
  '/dashboard',
  '/jobs',
  '/tasks',
  '/branches',
  '/incidents',
  '/team',
  '/inbox',
  '/analytics',
  '/billing',
  '/customers',
  '/settings',
] as const;

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => matchesRoute(pathname, route));
}

export function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => matchesRoute(pathname, route));
}

export function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some((route) => matchesRoute(pathname, route));
}
