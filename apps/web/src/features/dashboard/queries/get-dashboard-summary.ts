import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { Database } from '@pulseops/supabase/types';
import type { DashboardSummary } from '@/features/dashboard/types/dashboard.types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { loadProfileLabelMap } from '@/lib/data/load-label-maps';

interface Input {
  tenantId: string;
  _branchId: string | null;
  branchName: string | null;
}

type IncidentActivityRow = Pick<
  Database['public']['Tables']['incident_timeline_events']['Row'],
  'id' | 'title' | 'description' | 'created_at'
>;

type JobActivityRow = Pick<
  Database['public']['Tables']['job_timeline_events']['Row'],
  'id' | 'title' | 'description' | 'created_at'
>;

export async function getDashboardSummary({
  tenantId,
  _branchId: branchId,
  branchName,
}: Input): Promise<DashboardSummary> {
  const supabase = await createSupabaseServerClient();
  const locationsCountQuery = supabase
    .from('locations')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', tenantId);
  const membersCountQuery = supabase
    .from('organization_members')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', tenantId);
  let incidentsCountQuery = supabase
    .from('incidents')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', tenantId);
  let incidentsRiskCountQuery = supabase
    .from('incidents')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', tenantId)
    .eq('sla_risk', true);
  let jobsCountQuery = supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', tenantId)
    .in('status', ['new', 'scheduled', 'in_progress', 'blocked']);
  let incidentsListQuery = supabase
    .from('incidents')
    .select('id, title, severity, status, opened_at')
    .eq('organization_id', tenantId)
    .order('opened_at', { ascending: false })
    .limit(3);
  let jobsListQuery = supabase
    .from('jobs')
    .select('id, title, due_at, status, assignee_user_id')
    .eq('organization_id', tenantId)
    .order('due_at', { ascending: true, nullsFirst: false })
    .limit(3);

  let branchIncidentIds: string[] = [];
  let branchJobIds: string[] = [];

  if (branchId) {
    incidentsCountQuery = incidentsCountQuery.eq('location_id', branchId);
    incidentsRiskCountQuery = incidentsRiskCountQuery.eq('location_id', branchId);
    jobsCountQuery = jobsCountQuery.eq('location_id', branchId);
    incidentsListQuery = incidentsListQuery.eq('location_id', branchId);
    jobsListQuery = jobsListQuery.eq('location_id', branchId);

    const [branchIncidentsResult, branchJobsResult] = await Promise.all([
      supabase
        .from('incidents')
        .select('id')
        .eq('organization_id', tenantId)
        .eq('location_id', branchId),
      supabase
        .from('jobs')
        .select('id')
        .eq('organization_id', tenantId)
        .eq('location_id', branchId),
    ]);

    if (branchIncidentsResult.error) {
      throw new Error(branchIncidentsResult.error.message);
    }

    if (branchJobsResult.error) {
      throw new Error(branchJobsResult.error.message);
    }

    branchIncidentIds = branchIncidentsResult.data.map((row) => row.id);
    branchJobIds = branchJobsResult.data.map((row) => row.id);
  }

  const [
    locationsResult,
    membersResult,
    incidentsCountResult,
    incidentsRiskResult,
    jobsCountResult,
    incidentsListResult,
    jobsListResult,
  ] = await Promise.all([
    locationsCountQuery,
    membersCountQuery,
    incidentsCountQuery,
    incidentsRiskCountQuery,
    jobsCountQuery,
    incidentsListQuery,
    jobsListQuery,
  ]);

  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  if (incidentsCountResult.error) {
    throw new Error(incidentsCountResult.error.message);
  }

  if (incidentsRiskResult.error) {
    throw new Error(incidentsRiskResult.error.message);
  }

  if (jobsCountResult.error) {
    throw new Error(jobsCountResult.error.message);
  }

  if (incidentsListResult.error) {
    throw new Error(incidentsListResult.error.message);
  }

  if (jobsListResult.error) {
    throw new Error(jobsListResult.error.message);
  }

  const [incidentActivity, jobActivity, profileLabels] = await Promise.all([
    getIncidentActivity(supabase, tenantId, branchId ? branchIncidentIds : null),
    getJobActivity(supabase, tenantId, branchId ? branchJobIds : null),
    loadProfileLabelMap(
      supabase,
      jobsListResult.data.flatMap((job) =>
        job.assignee_user_id ? [job.assignee_user_id] : [],
      ),
    ),
  ]);

  const branchTotal = locationsResult.count ?? 0;
  const memberTotal = membersResult.count ?? 0;
  const incidentTotal = incidentsCountResult.count ?? 0;
  const activeJobTotal = jobsCountResult.count ?? 0;
  const atRiskCount = incidentsRiskResult.count ?? 0;
  const branchLabel = branchName ?? 'selected branch';
  const recentActivity = [...incidentActivity, ...jobActivity]
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, 3);
  const blockedJobs = jobsListResult.data.filter((job) => job.status === 'blocked').length;

  return {
    kpis: [
      {
        label: 'Active branches',
        value: String(branchTotal),
        delta: '+1',
        direction: 'up',
        helperText: 'Provisioned in the current workspace',
      },
      {
        label: 'Operators',
        value: String(memberTotal),
        delta: '+0',
        direction: 'neutral',
        helperText: 'Members with authenticated app access',
      },
      {
        label: 'Open incidents',
        value: String(incidentTotal),
        delta: incidentTotal > 0 ? String(incidentTotal) : '+0',
        direction: incidentTotal > 0 ? 'up' : 'neutral',
        helperText: `Tracked in ${branchLabel}`,
      },
      {
        label: 'Active jobs',
        value: String(activeJobTotal),
        delta: activeJobTotal > 0 ? String(activeJobTotal) : '+0',
        direction: activeJobTotal > 0 ? 'up' : 'neutral',
        helperText: `Execution queue around ${branchLabel}`,
      },
      {
        label: 'SLA at risk',
        value: String(atRiskCount),
        delta: atRiskCount > 0 ? String(atRiskCount) : '+0',
        direction: atRiskCount > 0 ? 'up' : 'neutral',
        helperText: 'Incidents currently outside a healthy response posture',
      },
    ],
    incidents: incidentsListResult.data.map((incident) => ({
      id: incident.id,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      openedLabel: formatDateTimeLabel(incident.opened_at),
    })),
    upcomingJobs: jobsListResult.data.map((job) => ({
      id: job.id,
      title: job.title,
      dueLabel: formatDateTimeLabel(job.due_at),
      assigneeLabel: job.assignee_user_id
        ? (profileLabels.get(job.assignee_user_id) ?? 'Unassigned')
        : 'Unassigned',
      status: job.status,
    })),
    recentActivity: recentActivity.map((entry) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      timestamp: formatDateTimeLabel(entry.created_at),
    })),
    branchHealth: [
      {
        label: 'Response load',
        value: String(incidentTotal),
        tone: incidentTotal > 0 ? 'warning' : 'success',
      },
      { label: 'Branch coverage', value: String(branchTotal), tone: 'default' },
      { label: 'Operators', value: String(memberTotal), tone: 'default' },
      { label: 'Blocked jobs', value: String(blockedJobs), tone: 'danger' },
    ],
    slaRiskCount: atRiskCount,
  };
}

async function getIncidentActivity(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  tenantId: string,
  incidentIds: string[] | null,
) {
  if (incidentIds?.length === 0) {
    return [] as IncidentActivityRow[];
  }

  let query = supabase
    .from('incident_timeline_events')
    .select('id, title, description, created_at')
    .eq('organization_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (incidentIds) {
    query = query.in('incident_id', incidentIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getJobActivity(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  tenantId: string,
  jobIds: string[] | null,
) {
  if (jobIds?.length === 0) {
    return [] as JobActivityRow[];
  }

  let query = supabase
    .from('job_timeline_events')
    .select('id, title, description, created_at')
    .eq('organization_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (jobIds) {
    query = query.in('job_id', jobIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
