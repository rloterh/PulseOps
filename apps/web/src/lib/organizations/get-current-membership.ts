import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getSessionUser } from '@/lib/auth/get-session-user';
import type { CurrentMembership, OrganizationContext } from '@/features/organizations/types';

export async function getCurrentMembership(
  userId?: string,
): Promise<CurrentMembership | null> {
  const sessionUser = userId ? { id: userId } : await getSessionUser();

  if (!sessionUser) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('id, organization_id, role')
    .eq('user_id', sessionUser.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership) {
    return null;
  }

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .select('id, name, slug, created_at')
    .eq('id', membership.organization_id)
    .single();

  if (organizationError) {
    throw new Error(organizationError.message);
  }

  return {
    ...membership,
    organization: organization as OrganizationContext,
  };
}
