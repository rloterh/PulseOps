import 'server-only';

import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentMembership } from './get-current-membership';

export async function requireCurrentMembership(userId?: string) {
  const membership = await getCurrentMembership(userId);

  if (!membership) {
    redirect('/onboarding' as Route);
  }

  return membership;
}
