import 'server-only';

import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { AppShellContext } from '@/features/shell/types/shell.types';
import { requireCurrentMembership } from '@/lib/organizations/require-current-membership';
import { ACTIVE_BRANCH_COOKIE_NAME } from './active-branch-preference';
import { resolveActiveBranchId } from './resolve-active-branch';

interface Input {
  userId: string;
}

export async function getActiveBranchContext({
  userId,
}: Input): Promise<AppShellContext> {
  const membership = await requireCurrentMembership(userId);
  const supabase = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const [{ data: profile, error: profileError }, { data: locations, error: locationsError }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('email, full_name, avatar_url')
        .eq('id', userId)
        .single(),
      supabase
        .from('locations')
        .select('id, name, code, timezone')
        .eq('organization_id', membership.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true }),
    ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (locationsError) {
    throw new Error(locationsError.message);
  }

  const preferredBranchId = cookieStore.get(ACTIVE_BRANCH_COOKIE_NAME)?.value ?? null;
  const mappedBranches = locations.map((location, index) => ({
    id: location.id,
    name: location.name,
    code: location.code,
    timezone: location.timezone,
    locationLabel: location.timezone
      ? `Timezone ${location.timezone}`
      : 'No timezone configured',
    isActive: index === 0,
  }));
  const activeBranchId = resolveActiveBranchId(mappedBranches, preferredBranchId);
  const branches = mappedBranches.map((branch) => ({
    ...branch,
    isActive: branch.id === activeBranchId,
  }));

  const activeBranch = branches.find((branch) => branch.isActive) ?? null;

  return {
    tenantId: membership.organization.id,
    tenantName: membership.organization.name,
    activeBranchId: activeBranch?.id ?? null,
    activeBranchName: activeBranch?.name ?? null,
    viewer: {
      id: userId,
      email: profile.email ?? 'Unknown user',
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      role: membership.role,
    },
    branches,
  };
}
