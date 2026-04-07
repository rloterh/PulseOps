import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { loadLocationNameMap, loadProfileLabelMap } from '@/lib/data/load-label-maps';
import type {
  IncidentDetail,
  IncidentEscalationEntry,
  IncidentListFilters,
  IncidentListItem,
  IncidentTimelineEntry,
} from '@/features/incidents/types/incident.types';
import { listIncidentEscalationsFromDb } from './incident-escalations.repository';

type IncidentRow = Database['public']['Tables']['incidents']['Row'];
type JobRow = Pick<Database['public']['Tables']['jobs']['Row'], 'id' | 'reference'>;
type IncidentTimelineRecord = Database['public']['Tables']['incident_timeline_events']['Row'];
type IncidentMutationRecord = Pick<
  IncidentRow,
  | 'id'
  | 'title'
  | 'reference'
  | 'status'
  | 'assignee_user_id'
  | 'location_id'
  | 'resolved_at'
  | 'closed_at'
>;

interface ScopedIncidentInput {
  tenantId: string;
  branchId: string | null;
  incidentId: string;
}

interface UpdateIncidentStatusInput extends ScopedIncidentInput {
  status: Database['public']['Enums']['incident_status'];
}

interface AssignIncidentInput extends ScopedIncidentInput {
  assigneeUserId: string | null;
}

export async function getIncidentsListFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    branchId: string | null;
    filters: IncidentListFilters;
  },
): Promise<IncidentListItem[]> {
  let query = supabase
    .from('incidents')
    .select('*')
    .eq('organization_id', input.tenantId);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  if (input.filters.q) {
    const q = sanitizeSearchQuery(input.filters.q);
    query = query.or(
      `title.ilike.%${q}%,reference.ilike.%${q}%,site_name.ilike.%${q}%,customer_name.ilike.%${q}%`,
    );
  }

  if (input.filters.severity && input.filters.severity !== 'all') {
    query = query.eq('severity', input.filters.severity);
  }

  if (input.filters.status && input.filters.status !== 'all') {
    query = query.eq('status', input.filters.status);
  }

  if (input.filters.slaRisk === 'at-risk') {
    query = query.eq('sla_risk', true);
  }

  if (input.filters.slaRisk === 'healthy') {
    query = query.eq('sla_risk', false);
  }

  const ascending = input.filters.direction === 'asc';

  if (input.filters.sort === 'title') {
    query = query
      .order('title', { ascending })
      .order('opened_at', { ascending: false });
  } else if (input.filters.sort === 'severity') {
    query = query
      .order('severity', { ascending })
      .order('opened_at', { ascending: false });
  } else if (input.filters.sort === 'status') {
    query = query
      .order('status', { ascending })
      .order('opened_at', { ascending: false });
  } else {
    query = query.order('opened_at', { ascending });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const locationNames = await loadLocationNameMap(
    supabase,
    data.map((row) => row.location_id),
  );
  const profileLabels = await loadProfileLabelMap(
    supabase,
    data.flatMap((row) =>
      row.assignee_user_id ? [row.owner_user_id, row.assignee_user_id] : [row.owner_user_id],
    ),
  );

  return data.map((row) => mapIncidentListItem(row, locationNames, profileLabels));
}

export async function getIncidentDetailFromDb(
  supabase: SupabaseClient<Database>,
  input: ScopedIncidentInput,
): Promise<IncidentDetail | null> {
  let incidentQuery = supabase
    .from('incidents')
    .select('*')
    .eq('organization_id', input.tenantId)
    .eq('id', input.incidentId)
    .maybeSingle();

  if (input.branchId) {
    incidentQuery = supabase
      .from('incidents')
      .select('*')
      .eq('organization_id', input.tenantId)
      .eq('location_id', input.branchId)
      .eq('id', input.incidentId)
      .maybeSingle();
  }

  const { data: incident, error } = await incidentQuery;

  if (error) {
    throw new Error(error.message);
  }

  if (!incident) {
    return null;
  }

  const [linkedJobsResult, timelineResult, escalations, locationNames, profileLabels] =
    await Promise.all([
      supabase
        .from('jobs')
        .select('id, reference')
        .eq('organization_id', input.tenantId)
        .eq('incident_id', input.incidentId)
        .order('created_at', { ascending: false }),
      supabase
        .from('incident_timeline_events')
        .select('*')
        .eq('organization_id', input.tenantId)
        .eq('incident_id', input.incidentId)
        .order('created_at', { ascending: false }),
      listIncidentEscalationsFromDb(supabase, {
        tenantId: input.tenantId,
        incidentId: input.incidentId,
      }),
      loadLocationNameMap(supabase, [incident.location_id]),
      loadProfileLabelMap(
        supabase,
        incident.assignee_user_id
          ? [incident.owner_user_id, incident.assignee_user_id]
          : [incident.owner_user_id],
      ),
    ]);

  if (linkedJobsResult.error) {
    throw new Error(linkedJobsResult.error.message);
  }

  if (timelineResult.error) {
    throw new Error(timelineResult.error.message);
  }

  return mapIncidentDetail(
    incident,
    linkedJobsResult.data,
    escalations,
    timelineResult.data,
    locationNames,
    profileLabels,
  );
}

export async function updateIncidentStatusInDb(
  supabase: SupabaseClient<Database>,
  input: UpdateIncidentStatusInput,
): Promise<
  | (IncidentMutationRecord & {
      changed: boolean;
      previousStatus: Database['public']['Enums']['incident_status'];
    })
  | null
> {
  const current = await getScopedIncidentForMutation(supabase, input);

  if (!current) {
    return null;
  }

  if (current.status === input.status) {
    return {
      ...current,
      changed: false as const,
      previousStatus: current.status,
    };
  }

  const query = supabase
    .from('incidents')
    .update({
      status: input.status,
      resolved_at:
        input.status === 'resolved' || input.status === 'closed'
          ? new Date().toISOString()
          : null,
      closed_at: input.status === 'closed' ? new Date().toISOString() : null,
    })
    .eq('organization_id', input.tenantId)
    .eq('location_id', current.location_id)
    .eq('id', input.incidentId);

  const { data, error } = await query
    .select('id, title, reference, status, assignee_user_id, location_id, resolved_at, closed_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...data,
    changed: true as const,
    previousStatus: current.status,
  };
}

export async function getIncidentMutationTargetFromDb(
  supabase: SupabaseClient<Database>,
  input: ScopedIncidentInput,
) {
  return getScopedIncidentForMutation(supabase, input);
}

export async function assignIncidentInDb(
  supabase: SupabaseClient<Database>,
  input: AssignIncidentInput,
): Promise<
  | (IncidentMutationRecord & {
      changed: boolean;
      previousAssigneeUserId: string | null;
    })
  | null
> {
  const current = await getScopedIncidentForMutation(supabase, input);

  if (!current) {
    return null;
  }

  if (current.assignee_user_id === input.assigneeUserId) {
    return {
      ...current,
      changed: false as const,
      previousAssigneeUserId: current.assignee_user_id,
    };
  }

  const query = supabase
    .from('incidents')
    .update({ assignee_user_id: input.assigneeUserId })
    .eq('organization_id', input.tenantId)
    .eq('location_id', current.location_id)
    .eq('id', input.incidentId);

  const { data, error } = await query
    .select('id, title, reference, status, assignee_user_id, location_id, resolved_at, closed_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...data,
    changed: true as const,
    previousAssigneeUserId: current.assignee_user_id,
  };
}

async function getScopedIncidentForMutation(
  supabase: SupabaseClient<Database>,
  input: ScopedIncidentInput,
): Promise<IncidentMutationRecord | null> {
  const { data, error } = await supabase
    .from('incidents')
    .select('id, title, reference, status, assignee_user_id, location_id, resolved_at, closed_at')
    .eq('organization_id', input.tenantId)
    .eq('id', input.incidentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function mapIncidentListItem(
  row: IncidentRow,
  locationNames: Map<string, string>,
  profileLabels: Map<string, string>,
): IncidentListItem {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    branchId: row.location_id,
    branchName: locationNames.get(row.location_id) ?? 'Unknown branch',
    siteName: row.site_name,
    severity: row.severity,
    status: row.status,
    slaRisk: row.sla_risk,
    openedAtLabel: formatDateTimeLabel(row.opened_at),
    ownerName: profileLabels.get(row.owner_user_id) ?? 'Unknown owner',
    assigneeName: row.assignee_user_id
      ? (profileLabels.get(row.assignee_user_id) ?? null)
      : null,
  };
}

function mapIncidentDetail(
  row: IncidentRow,
  linkedJobs: JobRow[],
  escalations: IncidentEscalationEntry[],
  timeline: IncidentTimelineRecord[],
  locationNames: Map<string, string>,
  profileLabels: Map<string, string>,
): IncidentDetail {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    summary: row.summary,
    branchId: row.location_id,
    branchName: locationNames.get(row.location_id) ?? 'Unknown branch',
    siteName: row.site_name,
    customerName: row.customer_name,
    severity: row.severity,
    status: row.status,
    slaRisk: row.sla_risk,
    escalationLevel: row.escalation_level,
    openedAtLabel: formatDateTimeLabel(row.opened_at),
    acknowledgedAtLabel: row.acknowledged_at
      ? formatDateTimeLabel(row.acknowledged_at)
      : null,
    resolvedAtLabel: row.resolved_at ? formatDateTimeLabel(row.resolved_at) : null,
    closedAtLabel: row.closed_at ? formatDateTimeLabel(row.closed_at) : null,
    ownerName: profileLabels.get(row.owner_user_id) ?? 'Unknown owner',
    assigneeName: row.assignee_user_id
      ? (profileLabels.get(row.assignee_user_id) ?? null)
      : null,
    currentAssigneeUserId: row.assignee_user_id,
    impactSummary: row.impact_summary,
    nextAction: row.next_action,
    linkedJobs: linkedJobs.map((job) => ({
      id: job.id,
      reference: job.reference,
    })),
    escalations,
    timeline: timeline.map(mapIncidentTimelineEntry),
  };
}

function mapIncidentTimelineEntry(row: IncidentTimelineRecord): IncidentTimelineEntry {
  return {
    id: row.id,
    type: row.event_type,
    title: row.title,
    description: row.description,
    actorName: row.actor_name,
    timestampLabel: formatDateTimeLabel(row.created_at),
  };
}

function sanitizeSearchQuery(query: string) {
  return query.replace(/[,%()]/g, ' ').trim();
}
