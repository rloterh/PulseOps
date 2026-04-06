import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { directorySearchSchema } from '@/features/directory/schemas/directory-search.schema';
import type {
  DirectorySearchInput,
  DirectoryUser,
} from '@/features/directory/types/directory.types';

export async function searchAssignableDirectory(
  input: DirectorySearchInput,
): Promise<DirectoryUser[]> {
  const parsed = directorySearchSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('search_assignable_directory', {
    p_org_id: parsed.organizationId,
    p_location_id: parsed.locationId,
    p_query: parsed.query,
    p_limit: parsed.limit,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((entry) => ({
    userId: entry.user_id,
    fullName: entry.full_name ?? entry.email ?? 'Unknown operator',
    email: entry.email,
    avatarUrl: entry.avatar_url,
    role: entry.org_role,
    isCurrentUser: entry.is_current_user,
    locationId: entry.location_id,
    locationName: entry.location_name,
  }));
}
