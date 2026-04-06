'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { assignIncidentInDb } from '@/features/incidents/repositories/incidents.repository';
import { assignIncidentSchema } from '@/features/incidents/schemas/incident-mutation.schemas';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { isMemberSelectionAllowed } from '@/lib/organizations/member-selection';

export async function assignIncidentAction(formData: FormData) {
  const rawAssignee = formData.get('assigneeUserId');
  const assigneeUserId =
    typeof rawAssignee === 'string' && rawAssignee.length > 0 ? rawAssignee : null;
  const parsed = assignIncidentSchema.safeParse({
    incidentId: formData.get('incidentId'),
    assigneeUserId,
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const assignees = await getMemberOptions(context.tenantId, context.branchId);

  if (!isMemberSelectionAllowed(assignees, parsed.data.assigneeUserId)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const updated = await assignIncidentInDb(supabase, {
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId: parsed.data.incidentId,
    assigneeUserId: parsed.data.assigneeUserId,
  });

  if (!updated) {
    return;
  }

  if (updated.changed) {
    await insertTimelineEvent(supabase, {
      kind: 'incident',
      tenantId: context.tenantId,
      parentId: parsed.data.incidentId,
      eventType: 'assignment',
      title: parsed.data.assigneeUserId ? 'Incident assigned' : 'Incident unassigned',
      description: parsed.data.assigneeUserId
        ? `${updated.title} assignment was updated.`
        : `${updated.title} no longer has an assignee.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });

    revalidatePath('/dashboard');
    revalidatePath('/incidents');
    revalidatePath(`/incidents/${parsed.data.incidentId}`);
  }

  return;
}
