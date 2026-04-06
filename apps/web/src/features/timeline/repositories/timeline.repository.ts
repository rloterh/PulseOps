import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';
import type { TimelineInsertInput } from '@/features/timeline/types/timeline.types';

export async function insertTimelineEvent(
  supabase: SupabaseClient<Database>,
  input: TimelineInsertInput,
) {
  if (input.kind === 'incident') {
    const { error } = await supabase.from('incident_timeline_events').insert({
      organization_id: input.tenantId,
      incident_id: input.parentId,
      event_type: input.eventType,
      title: input.title,
      description: input.description,
      actor_user_id: input.actorUserId,
      actor_name: input.actorName,
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await supabase.from('job_timeline_events').insert({
    organization_id: input.tenantId,
    job_id: input.parentId,
    event_type: input.eventType,
    title: input.title,
    description: input.description,
    actor_user_id: input.actorUserId,
    actor_name: input.actorName,
  });

  if (error) {
    throw new Error(error.message);
  }
}
