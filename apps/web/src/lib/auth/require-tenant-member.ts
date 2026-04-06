import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireUser } from './require-user';
import { requireCurrentMembership } from '@/lib/organizations/require-current-membership';
import { getActiveBranchContext } from '@/lib/tenancy/get-active-branch-context';

export async function requireTenantMember() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const membership = await requireCurrentMembership(user.id);
  const shell = await getActiveBranchContext({ userId: user.id });

  return {
    supabase,
    viewerId: user.id,
    viewerEmail: user.email ?? 'Unknown user',
    viewerName: shell.viewer.fullName ?? user.email ?? 'Unknown user',
    tenantId: membership.organization_id,
    tenantName: membership.organization.name,
    branchId: shell.activeBranchId,
    branchName: shell.activeBranchName,
    membershipRole: membership.role,
  };
}
