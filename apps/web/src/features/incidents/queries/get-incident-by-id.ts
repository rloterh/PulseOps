import 'server-only';

import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { syncIncidentSlaState } from '@/features/incidents/lib/sync-incident-sla';
import { getIncidentDetailFromDb } from '@/features/incidents/repositories/incidents.repository';

export async function getIncidentById(input: {
  tenantId: string;
  branchId: string | null;
  incidentId: string;
}) {
  const supabase = await createSupabaseServerClient();
  await syncIncidentSlaState(supabase, {
    tenantId: input.tenantId,
    incidentId: input.incidentId,
  });
  const incident = await getIncidentDetailFromDb(supabase, input);

  if (!incident) {
    notFound();
  }

  return incident;
}
