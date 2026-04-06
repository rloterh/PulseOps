import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getIncidentsListFromDb } from '@/features/incidents/repositories/incidents.repository';
import type { IncidentListFilters } from '@/features/incidents/types/incident.types';

export async function getIncidentsList(input: {
  tenantId: string;
  branchId: string | null;
  filters: IncidentListFilters;
}) {
  const supabase = await createSupabaseServerClient();
  return getIncidentsListFromDb(supabase, input);
}
