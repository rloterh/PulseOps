import type { Database } from '@pulseops/supabase/types';
import { SafeError } from '@/lib/security/safe-error';

export type OrganizationRole = Database['public']['Enums']['organization_role'];

const roleRank: Record<OrganizationRole, number> = {
  owner: 100,
  admin: 90,
  manager: 70,
  agent: 30,
};

export function assertRole(
  userRole: OrganizationRole,
  minimumRole: OrganizationRole,
) {
  if (roleRank[userRole] < roleRank[minimumRole]) {
    throw new SafeError({
      code: 'FORBIDDEN',
      status: 403,
      userMessage: 'You do not have permission to perform this action.',
    });
  }
}

export function assertSameOrg(actorOrgId: string, resourceOrgId: string) {
  if (actorOrgId !== resourceOrgId) {
    throw new SafeError({
      code: 'ORG_SCOPE_VIOLATION',
      status: 403,
      userMessage: 'You do not have access to this resource.',
    });
  }
}

export function assertBranchAccess(
  allowedBranchIds: string[],
  resourceBranchId: string | null,
) {
  if (!resourceBranchId) {
    return;
  }

  if (!allowedBranchIds.includes(resourceBranchId)) {
    throw new SafeError({
      code: 'BRANCH_SCOPE_VIOLATION',
      status: 403,
      userMessage: 'You do not have access to this branch resource.',
    });
  }
}
