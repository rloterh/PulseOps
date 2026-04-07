'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { updateIncidentSchema } from '@/features/incidents/schemas/incident-mutation.schemas';
import { updateIncident } from '@/features/incidents/lib/update-incident';
import type { CreateIncidentActionState } from '@/features/incidents/types/incident.types';

const initialError = 'Provide valid incident details before saving.';

export async function updateIncidentAction(
  _previousState: CreateIncidentActionState,
  formData: FormData,
): Promise<CreateIncidentActionState> {
  const parsed = updateIncidentSchema.safeParse({
    incidentId: formData.get('incidentId'),
    title: formData.get('title'),
    summary: formData.get('summary'),
    customerName: formData.get('customerName'),
    severity: formData.get('severity'),
    reportedAt: formData.get('reportedAt'),
    slaRisk: formData.get('slaRisk'),
    impactSummary: formData.get('impactSummary'),
    nextAction: formData.get('nextAction'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? initialError,
    };
  }

  const context = await requireTenantMember();
  const result = await updateIncident(parsed.data, context);

  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  revalidatePath('/dashboard');
  revalidatePath('/incidents');
  revalidatePath(`/incidents/${result.incidentId}`);
  revalidatePath('/admin/activity');
  redirect(`/incidents/${result.incidentId}`);
}
