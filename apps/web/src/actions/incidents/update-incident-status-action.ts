'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { updateIncidentStatusInDb } from '@/features/incidents/repositories/incidents.repository';
import { updateIncidentStatusSchema } from '@/features/incidents/schemas/incident-mutation.schemas';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

export async function updateIncidentStatusAction(formData: FormData) {
  const parsed = updateIncidentStatusSchema.safeParse({
    incidentId: formData.get('incidentId'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();
  const updated = await updateIncidentStatusInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId: parsed.data.incidentId,
    status: parsed.data.status,
  });

  if (!updated) {
    return;
  }

  if (updated.changed) {
    await insertTimelineEvent(supabase, {
      kind: 'incident',
      tenantId: context.tenantId,
      parentId: parsed.data.incidentId,
      eventType: parsed.data.status === 'resolved' ? 'resolution' : 'status_change',
      title:
        parsed.data.status === 'resolved'
          ? 'Incident resolved'
          : 'Incident status updated',
      description:
        parsed.data.status === 'resolved'
          ? `${updated.title} was marked as resolved.`
          : `${updated.title} moved to ${parsed.data.status.replaceAll('_', ' ')}.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });

    revalidatePath('/dashboard');
    revalidatePath('/incidents');
    revalidatePath(`/incidents/${parsed.data.incidentId}`);
  }

  return;
}
