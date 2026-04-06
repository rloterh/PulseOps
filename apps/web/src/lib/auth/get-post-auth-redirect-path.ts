import 'server-only';

import type { Route } from 'next';
import { getCurrentMembership } from '@/lib/organizations/get-current-membership';
import { getSafeNextPath } from './get-safe-next-path';

const dashboardPath: Route = '/dashboard';
const onboardingPath: Route = '/onboarding';

export async function getPostAuthRedirectPath({
  userId,
  next,
}: {
  userId: string;
  next?: string | null | undefined;
}): Promise<Route> {
  const membership = await getCurrentMembership(userId);

  if (!membership) {
    return onboardingPath;
  }

  const safeNextPath = getSafeNextPath(next, dashboardPath);

  if (safeNextPath === onboardingPath) {
    return dashboardPath;
  }

  return safeNextPath;
}
