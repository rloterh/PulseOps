import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { DirectoryUser } from '@/features/directory/types/directory.types';

export async function getAssignableUserById(input: {
  organizationId: string;
  locationId: string;
  userId: string;
}): Promise<DirectoryUser | null> {
  const supabase = await createSupabaseServerClient();
  const [{ data: membership, error: membershipError }, { data: profile, error: profileError }, { data: access, error: accessError }, { data: location, error: locationError }] =
    await Promise.all([
      supabase
        .from('organization_members')
        .select('role, is_active')
        .eq('organization_id', input.organizationId)
        .eq('user_id', input.userId)
        .eq('is_active', true)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, is_active')
        .eq('id', input.userId)
        .eq('is_active', true)
        .maybeSingle(),
      supabase
        .from('location_member_access')
        .select('location_id')
        .eq('organization_id', input.organizationId)
        .eq('location_id', input.locationId)
        .eq('user_id', input.userId)
        .eq('is_active', true)
        .maybeSingle(),
      supabase
        .from('locations')
        .select('id, name')
        .eq('organization_id', input.organizationId)
        .eq('id', input.locationId)
        .eq('is_active', true)
        .maybeSingle(),
    ]);

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (accessError) {
    throw new Error(accessError.message);
  }

  if (locationError) {
    throw new Error(locationError.message);
  }

  if (!membership || !profile || !access || !location) {
    return null;
  }

  return {
    userId: profile.id,
    fullName: profile.full_name ?? profile.email ?? 'Unknown operator',
    email: profile.email,
    avatarUrl: profile.avatar_url,
    role: membership.role,
    isCurrentUser: false,
    locationId: location.id,
    locationName: location.name,
  };
}
