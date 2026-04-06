import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import {
  loadIncidentReferenceMap,
  loadLocationNameMap,
  loadProfileLabelMap,
} from '@/lib/data/load-label-maps';
import type {
  JobDetail,
  JobListFilters,
  JobListItem,
  JobTimelineEntry,
} from '@/features/jobs/types/job.types';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type JobTimelineRecord = Database['public']['Tables']['job_timeline_events']['Row'];
type JobMutationRecord = Pick<
  JobRow,
  'id' | 'title' | 'status' | 'assignee_user_id' | 'location_id'
>;

interface ScopedJobInput {
  tenantId: string;
  branchId: string | null;
  jobId: string;
}

interface UpdateJobStatusInput extends ScopedJobInput {
  status: Database['public']['Enums']['job_status'];
}

interface AssignJobInput extends ScopedJobInput {
  assigneeUserId: string | null;
}

export async function getJobsListFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    branchId: string | null;
    filters: JobListFilters;
  },
): Promise<JobListItem[]> {
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('organization_id', input.tenantId)
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  if (input.filters.q) {
    const q = sanitizeSearchQuery(input.filters.q);
    query = query.or(
      `title.ilike.%${q}%,reference.ilike.%${q}%,site_name.ilike.%${q}%,customer_name.ilike.%${q}%`,
    );
  }

  if (input.filters.priority && input.filters.priority !== 'all') {
    query = query.eq('priority', input.filters.priority);
  }

  if (input.filters.status && input.filters.status !== 'all') {
    query = query.eq('status', input.filters.status);
  }

  if (input.filters.type && input.filters.type !== 'all') {
    query = query.eq('type', input.filters.type);
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
    data.flatMap((row) => (row.assignee_user_id ? [row.assignee_user_id] : [])),
  );

  return data.map((row) => mapJobListItem(row, locationNames, profileLabels));
}

export async function getJobDetailFromDb(
  supabase: SupabaseClient<Database>,
  input: ScopedJobInput,
): Promise<JobDetail | null> {
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('organization_id', input.tenantId)
    .eq('id', input.jobId)
    .maybeSingle();

  if (input.branchId) {
    query = supabase
      .from('jobs')
      .select('*')
      .eq('organization_id', input.tenantId)
      .eq('location_id', input.branchId)
      .eq('id', input.jobId)
      .maybeSingle();
  }

  const { data: job, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!job) {
    return null;
  }

  const [timelineResult, locationNames, profileLabels, incidentReferences] = await Promise.all([
    supabase
      .from('job_timeline_events')
      .select('*')
      .eq('organization_id', input.tenantId)
      .eq('job_id', input.jobId)
      .order('created_at', { ascending: false }),
    loadLocationNameMap(supabase, [job.location_id]),
    loadProfileLabelMap(
      supabase,
      job.assignee_user_id ? [job.assignee_user_id] : [],
    ),
    loadIncidentReferenceMap(supabase, job.incident_id ? [job.incident_id] : []),
  ]);

  if (timelineResult.error) {
    throw new Error(timelineResult.error.message);
  }

  return mapJobDetail(
    job,
    timelineResult.data,
    locationNames,
    profileLabels,
    incidentReferences,
  );
}

export async function updateJobStatusInDb(
  supabase: SupabaseClient<Database>,
  input: UpdateJobStatusInput,
): Promise<
  | (JobMutationRecord & {
      changed: boolean;
      previousStatus: Database['public']['Enums']['job_status'];
    })
  | null
> {
  const current = await getScopedJobForMutation(supabase, input);

  if (!current) {
    return null;
  }

  if (current.status === input.status) {
    return { ...current, changed: false as const, previousStatus: current.status };
  }

  const query = supabase
    .from('jobs')
    .update({ status: input.status })
    .eq('organization_id', input.tenantId)
    .eq('location_id', current.location_id)
    .eq('id', input.jobId);

  const { data, error } = await query
    .select('id, title, status, assignee_user_id, location_id')
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

export async function getJobMutationTargetFromDb(
  supabase: SupabaseClient<Database>,
  input: ScopedJobInput,
) {
  return getScopedJobForMutation(supabase, input);
}

export async function assignJobInDb(
  supabase: SupabaseClient<Database>,
  input: AssignJobInput,
): Promise<
  | (JobMutationRecord & {
      changed: boolean;
      previousAssigneeUserId: string | null;
    })
  | null
> {
  const current = await getScopedJobForMutation(supabase, input);

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
    .from('jobs')
    .update({ assignee_user_id: input.assigneeUserId })
    .eq('organization_id', input.tenantId)
    .eq('location_id', current.location_id)
    .eq('id', input.jobId);

  const { data, error } = await query
    .select('id, title, status, assignee_user_id, location_id')
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

async function getScopedJobForMutation(
  supabase: SupabaseClient<Database>,
  input: ScopedJobInput,
): Promise<JobMutationRecord | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, status, assignee_user_id, location_id')
    .eq('organization_id', input.tenantId)
    .eq('id', input.jobId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function mapJobListItem(
  row: JobRow,
  locationNames: Map<string, string>,
  profileLabels: Map<string, string>,
): JobListItem {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    branchId: row.location_id,
    branchName: locationNames.get(row.location_id) ?? 'Unknown branch',
    siteName: row.site_name,
    priority: row.priority,
    status: row.status,
    type: row.type,
    dueAtLabel: formatDateTimeLabel(row.due_at),
    assigneeName: row.assignee_user_id
      ? (profileLabels.get(row.assignee_user_id) ?? null)
      : null,
    linkedIncidentId: row.incident_id,
  };
}

function mapJobDetail(
  row: JobRow,
  timeline: JobTimelineRecord[],
  locationNames: Map<string, string>,
  profileLabels: Map<string, string>,
  incidentReferences: Map<string, string>,
): JobDetail {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    summary: row.summary,
    branchId: row.location_id,
    branchName: locationNames.get(row.location_id) ?? 'Unknown branch',
    siteName: row.site_name,
    customerName: row.customer_name,
    priority: row.priority,
    status: row.status,
    type: row.type,
    dueAtLabel: formatDateTimeLabel(row.due_at),
    assigneeName: row.assignee_user_id
      ? (profileLabels.get(row.assignee_user_id) ?? null)
      : null,
    currentAssigneeUserId: row.assignee_user_id,
    linkedIncident: row.incident_id
      ? {
          id: row.incident_id,
          reference: incidentReferences.get(row.incident_id) ?? 'Linked incident',
        }
      : null,
    checklistSummary: row.checklist_summary,
    resolutionSummary: row.resolution_summary,
    timeline: timeline.map(mapJobTimelineEntry),
  };
}

function mapJobTimelineEntry(row: JobTimelineRecord): JobTimelineEntry {
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
