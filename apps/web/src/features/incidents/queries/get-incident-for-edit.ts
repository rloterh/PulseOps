import 'server-only';

import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { loadLocationNameMap } from '@/lib/data/load-label-maps';
import type { IncidentEditRecord } from '@/features/incidents/types/incident.types';

export async function getIncidentForEdit(input: {
  tenantId: string;
  branchId: string | null;
  incidentId: string;
}) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('incidents')
    .select(
      'id, location_id, title, summary, customer_name, severity, opened_at, sla_risk, impact_summary, next_action',
    )
    .eq('organization_id', input.tenantId)
    .eq('id', input.incidentId);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const locationNames = await loadLocationNameMap(supabase, [data.location_id]);

  const incident: IncidentEditRecord = {
    id: data.id,
    branchId: data.location_id,
    branchName: locationNames.get(data.location_id) ?? 'Unknown branch',
    title: data.title,
    summary: data.summary,
    customerName: data.customer_name,
    severity: data.severity,
    reportedAt: data.opened_at,
    slaRisk: data.sla_risk,
    impactSummary: data.impact_summary,
    nextAction: data.next_action,
  };

  return incident;
}
