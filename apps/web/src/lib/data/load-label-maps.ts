import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';

export async function loadLocationNameMap(
  supabase: SupabaseClient<Database>,
  locationIds: string[],
) {
  const uniqueLocationIds = Array.from(new Set(locationIds));

  if (uniqueLocationIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from('locations')
    .select('id, name')
    .in('id', uniqueLocationIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(data.map((location) => [location.id, location.name]));
}

export async function loadProfileLabelMap(
  supabase: SupabaseClient<Database>,
  userIds: string[],
) {
  const uniqueUserIds = Array.from(new Set(userIds));

  if (uniqueUserIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', uniqueUserIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    data.map((profile) => [
      profile.id,
      profile.full_name ?? profile.email ?? 'Unknown operator',
    ]),
  );
}
