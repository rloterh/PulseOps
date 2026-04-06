import 'server-only';

import type { Database } from '@pulseops/supabase/types';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { getAssignableUserById } from '@/features/directory/queries/get-assignable-user-by-id';
import { ensureRecordWatchersInDb } from '@/features/collaboration/repositories/collaboration.repository';
import { createRecordNotifications } from '@/features/notifications/repositories/notifications.repository';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import type { CreateIncidentInput } from '@/features/incidents/schemas/create-incident.schema';
import { canCreateIncidents } from './incident-permissions';

interface CreateIncidentContext {
  viewerId: string;
  viewerName: string;
  tenantId: string;
  membershipRole: Database['public']['Enums']['organization_role'];
}

export async function createIncident(
  input: CreateIncidentInput,
  context: CreateIncidentContext,
): Promise<
  | { ok: false; error: string }
  | { ok: true; incidentId: string; locationId: string }
> {
  if (!canCreateIncidents(context.membershipRole)) {
    return {
      ok: false,
      error: 'You do not have permission to report incidents for this workspace.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('id, name')
    .eq('organization_id', context.tenantId)
    .eq('id', input.locationId)
    .eq('is_active', true)
    .maybeSingle();

  if (locationError) {
    throw new Error(locationError.message);
  }

  if (!location) {
    return {
      ok: false,
      error: 'Selected branch is no longer available.',
    };
  }

  const assignee = input.assigneeUserId
    ? await getAssignableUserById({
        organizationId: context.tenantId,
        locationId: location.id,
        userId: input.assigneeUserId,
      })
    : null;

  if (input.assigneeUserId && !assignee) {
    return {
      ok: false,
      error: 'Selected assignee is no longer available for this branch.',
    };
  }

  const { data: reference, error: referenceError } = await supabase.rpc(
    'next_incident_reference',
    {
      target_org_id: context.tenantId,
    },
  );

  if (referenceError) {
    throw new Error(referenceError.message);
  }

  const { data: incident, error: insertError } = await supabase
    .from('incidents')
    .insert({
      organization_id: context.tenantId,
      location_id: location.id,
      reference,
      title: input.title,
      summary: input.summary,
      site_name: location.name,
      customer_name: input.customerName,
      severity: input.severity,
      status: 'open',
      sla_risk: input.slaRisk,
      owner_user_id: context.viewerId,
      assignee_user_id: assignee?.userId ?? null,
      impact_summary: input.impactSummary,
      next_action: input.nextAction,
      ...(input.reportedAt ? { opened_at: input.reportedAt } : {}),
    })
    .select('id, title, reference, location_id')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  await insertTimelineEvent(supabase, {
    kind: 'incident',
    tenantId: context.tenantId,
    parentId: incident.id,
    eventType: 'created',
    title: 'Incident created',
    description: assignee
      ? `${incident.reference} was reported for ${location.name} and assigned to ${assignee.fullName}.`
      : `${incident.reference} was reported for ${location.name}.`,
    actorUserId: context.viewerId,
    actorName: context.viewerName,
  });

  if (assignee) {
    await insertTimelineEvent(supabase, {
      kind: 'incident',
      tenantId: context.tenantId,
      parentId: incident.id,
      eventType: 'assignment',
      title: 'Assignee added during reporting',
      description: `${assignee.fullName} was assigned when the incident was reported.`,
      actorUserId: context.viewerId,
      actorName: context.viewerName,
    });
  }

  await ensureRecordWatchersInDb(supabase, {
    target: {
      entityType: 'incident',
      entityId: incident.id,
      organizationId: context.tenantId,
      locationId: incident.location_id,
      title: incident.title,
      reference: incident.reference,
    },
    watchers: [
      {
        userId: context.viewerId,
        source: 'creator',
      },
      ...(assignee
        ? [
            {
              userId: assignee.userId,
              source: 'assignee' as const,
            },
          ]
        : []),
    ],
  });

  if (assignee) {
    await createRecordNotifications({
      supabase: createSupabaseAdminClient(),
      target: {
        entityType: 'incident',
        entityId: incident.id,
        organizationId: context.tenantId,
        locationId: incident.location_id,
        title: incident.title,
        reference: incident.reference,
      },
      actorUserId: context.viewerId,
      eventType: 'record_created',
      title: `New incident assigned: ${incident.reference}`,
      body: `${context.viewerName} reported ${incident.title} and assigned it during intake.`,
    });
  }

  return {
    ok: true,
    incidentId: incident.id,
    locationId: incident.location_id,
  };
}
