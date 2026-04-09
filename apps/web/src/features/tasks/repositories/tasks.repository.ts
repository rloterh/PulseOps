import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import {
  loadIncidentReferenceMap,
  loadJobReferenceMap,
  loadLocationNameMap,
  loadProfileLabelMap,
} from '@/lib/data/load-label-maps';
import type {
  TaskDetail,
  TaskLinkOption,
  TaskListItem,
  TaskTimelineEntry,
} from '@/features/tasks/types/task.types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskTimelineRecord = Database['public']['Tables']['task_timeline_events']['Row'];
type TaskMutationRecord = Pick<
  TaskRow,
  'id' | 'title' | 'status' | 'assignee_user_id' | 'location_id'
>;

interface ScopedTaskInput {
  tenantId: string;
  branchId: string | null;
  taskId: string;
}

interface UpdateTaskStatusInput extends ScopedTaskInput {
  status: Database['public']['Enums']['task_status'];
}

interface AssignTaskInput extends ScopedTaskInput {
  assigneeUserId: string | null;
}

export async function getTasksListFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    branchId: string | null;
  },
): Promise<TaskListItem[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', input.tenantId)
    .order('created_at', { ascending: false });

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const [locationNames, profileLabels, incidentReferences, jobReferences] =
    await Promise.all([
      loadLocationNameMap(
        supabase,
        data.map((row) => row.location_id),
      ),
      loadProfileLabelMap(
        supabase,
        data.flatMap((row) =>
          row.assignee_user_id
            ? [row.created_by_user_id, row.assignee_user_id]
            : [row.created_by_user_id],
        ),
      ),
      loadIncidentReferenceMap(
        supabase,
        data.flatMap((row) => (row.linked_incident_id ? [row.linked_incident_id] : [])),
      ),
      loadJobReferenceMap(
        supabase,
        data.flatMap((row) => (row.linked_job_id ? [row.linked_job_id] : [])),
      ),
    ]);

  return data.map((row) =>
    mapTaskListItem(row, locationNames, profileLabels, incidentReferences, jobReferences),
  );
}

export async function getTaskDetailFromDb(
  supabase: SupabaseClient<Database>,
  input: ScopedTaskInput,
): Promise<TaskDetail | null> {
  let taskQuery = supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', input.tenantId)
    .eq('id', input.taskId)
    .maybeSingle();

  if (input.branchId) {
    taskQuery = supabase
      .from('tasks')
      .select('*')
      .eq('organization_id', input.tenantId)
      .eq('location_id', input.branchId)
      .eq('id', input.taskId)
      .maybeSingle();
  }

  const { data: task, error } = await taskQuery;

  if (error) {
    throw new Error(error.message);
  }

  if (!task) {
    return null;
  }

  const [timelineResult, locationNames, profileLabels, incidentReferences, jobReferences] =
    await Promise.all([
      supabase
        .from('task_timeline_events')
        .select('*')
        .eq('organization_id', input.tenantId)
        .eq('task_id', input.taskId)
        .order('created_at', { ascending: false }),
      loadLocationNameMap(supabase, [task.location_id]),
      loadProfileLabelMap(
        supabase,
        task.assignee_user_id
          ? [task.created_by_user_id, task.assignee_user_id]
          : [task.created_by_user_id],
      ),
      loadIncidentReferenceMap(
        supabase,
        task.linked_incident_id ? [task.linked_incident_id] : [],
      ),
      loadJobReferenceMap(
        supabase,
        task.linked_job_id ? [task.linked_job_id] : [],
      ),
    ]);

  if (timelineResult.error) {
    throw new Error(timelineResult.error.message);
  }

  return mapTaskDetail(
    task,
    timelineResult.data,
    locationNames,
    profileLabels,
    incidentReferences,
    jobReferences,
  );
}

export async function getTaskLinkOptionsFromDb(
  supabase: SupabaseClient<Database>,
  input: { tenantId: string },
): Promise<TaskLinkOption[]> {
  const [incidentsResult, jobsResult] = await Promise.all([
    supabase
      .from('incidents')
      .select('id, reference, title, location_id')
      .eq('organization_id', input.tenantId)
      .order('opened_at', { ascending: false })
      .limit(40),
    supabase
      .from('jobs')
      .select('id, reference, title, location_id')
      .eq('organization_id', input.tenantId)
      .order('created_at', { ascending: false })
      .limit(40),
  ]);

  if (incidentsResult.error) {
    throw new Error(incidentsResult.error.message);
  }

  if (jobsResult.error) {
    throw new Error(jobsResult.error.message);
  }

  return [
    ...incidentsResult.data.map((incident) => ({
      id: incident.id,
      reference: incident.reference,
      title: incident.title,
      locationId: incident.location_id,
      entityType: 'incident' as const,
    })),
    ...jobsResult.data.map((job) => ({
      id: job.id,
      reference: job.reference,
      title: job.title,
      locationId: job.location_id,
      entityType: 'job' as const,
    })),
  ];
}

export async function updateTaskStatusInDb(
  supabase: SupabaseClient<Database>,
  input: UpdateTaskStatusInput,
): Promise<
  | (TaskMutationRecord & {
      changed: boolean;
      previousStatus: Database['public']['Enums']['task_status'];
    })
  | null
> {
  const current = await getScopedTaskForMutation(supabase, input);

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

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: input.status })
    .eq('organization_id', input.tenantId)
    .eq('location_id', current.location_id)
    .eq('id', input.taskId)
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

export async function getTaskMutationTargetFromDb(
  supabase: SupabaseClient<Database>,
  input: ScopedTaskInput,
) {
  return getScopedTaskForMutation(supabase, input);
}

export async function assignTaskInDb(
  supabase: SupabaseClient<Database>,
  input: AssignTaskInput,
): Promise<
  | (TaskMutationRecord & {
      changed: boolean;
      previousAssigneeUserId: string | null;
    })
  | null
> {
  const current = await getScopedTaskForMutation(supabase, input);

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

  const { data, error } = await supabase
    .from('tasks')
    .update({ assignee_user_id: input.assigneeUserId })
    .eq('organization_id', input.tenantId)
    .eq('location_id', current.location_id)
    .eq('id', input.taskId)
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

async function getScopedTaskForMutation(
  supabase: SupabaseClient<Database>,
  input: ScopedTaskInput,
): Promise<TaskMutationRecord | null> {
  let query = supabase
    .from('tasks')
    .select('id, title, status, assignee_user_id, location_id')
    .eq('organization_id', input.tenantId)
    .eq('id', input.taskId);

  if (input.branchId) {
    query = query.eq('location_id', input.branchId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function mapTaskListItem(
  row: TaskRow,
  locationNames: Map<string, string>,
  profileLabels: Map<string, string>,
  incidentReferences: Map<string, string>,
  jobReferences: Map<string, string>,
): TaskListItem {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    branchId: row.location_id,
    branchName: locationNames.get(row.location_id) ?? 'Unknown branch',
    priority: row.priority,
    status: row.status,
    dueAtLabel: formatDateTimeLabel(row.due_at),
    assigneeName: row.assignee_user_id
      ? (profileLabels.get(row.assignee_user_id) ?? null)
      : null,
    linkedRecordLabel: row.linked_incident_id
      ? (incidentReferences.get(row.linked_incident_id) ?? null)
      : row.linked_job_id
        ? (jobReferences.get(row.linked_job_id) ?? null)
        : null,
  };
}

function mapTaskDetail(
  row: TaskRow,
  timeline: TaskTimelineRecord[],
  locationNames: Map<string, string>,
  profileLabels: Map<string, string>,
  incidentReferences: Map<string, string>,
  jobReferences: Map<string, string>,
): TaskDetail {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    summary: row.summary,
    branchId: row.location_id,
    branchName: locationNames.get(row.location_id) ?? 'Unknown branch',
    priority: row.priority,
    status: row.status,
    dueAtLabel: formatDateTimeLabel(row.due_at),
    assigneeName: row.assignee_user_id
      ? (profileLabels.get(row.assignee_user_id) ?? null)
      : null,
    currentAssigneeUserId: row.assignee_user_id,
    createdByName: profileLabels.get(row.created_by_user_id) ?? 'Unknown owner',
    completionSummary: row.completion_summary,
    linkedIncident: row.linked_incident_id
      ? {
          id: row.linked_incident_id,
          reference:
            incidentReferences.get(row.linked_incident_id) ?? 'Unknown incident',
        }
      : null,
    linkedJob: row.linked_job_id
      ? {
          id: row.linked_job_id,
          reference: jobReferences.get(row.linked_job_id) ?? 'Unknown job',
        }
      : null,
    timeline: timeline.map(mapTaskTimelineEntry),
  };
}

function mapTaskTimelineEntry(row: TaskTimelineRecord): TaskTimelineEntry {
  return {
    id: row.id,
    type: row.event_type,
    title: row.title,
    description: row.description,
    actorName: row.actor_name,
    timestampLabel: formatDateTimeLabel(row.created_at),
  };
}
