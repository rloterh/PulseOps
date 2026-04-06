import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';

export async function getDashboardStats(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const [locationsResult, membersResult] = await Promise.all([
    supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
  ]);

  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  return {
    locationsCount: locationsResult.count ?? 0,
    membersCount: membersResult.count ?? 0,
    openJobsCount: 0,
  };
}
