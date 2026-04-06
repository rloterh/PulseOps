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

export async function loadIncidentReferenceMap(
  supabase: SupabaseClient<Database>,
  incidentIds: string[],
) {
  const uniqueIncidentIds = Array.from(new Set(incidentIds));

  if (uniqueIncidentIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from('incidents')
    .select('id, reference')
    .in('id', uniqueIncidentIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(data.map((incident) => [incident.id, incident.reference]));
}

export async function loadJobReferenceMap(
  supabase: SupabaseClient<Database>,
  jobIds: string[],
) {
  const uniqueJobIds = Array.from(new Set(jobIds));

  if (uniqueJobIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('id, reference')
    .in('id', uniqueJobIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(data.map((job) => [job.id, job.reference]));
}

export async function loadTaskReferenceMap(
  supabase: SupabaseClient<Database>,
  taskIds: string[],
) {
  const uniqueTaskIds = Array.from(new Set(taskIds));

  if (uniqueTaskIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('id, reference')
    .in('id', uniqueTaskIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(data.map((task) => [task.id, task.reference]));
}
