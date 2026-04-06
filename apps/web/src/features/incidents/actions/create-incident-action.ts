'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import {
  ACTIVE_BRANCH_COOKIE_MAX_AGE_SECONDS,
  ACTIVE_BRANCH_COOKIE_NAME,
} from '@/lib/tenancy/active-branch-preference';
import { createIncidentSchema } from '@/features/incidents/schemas/create-incident.schema';
import { createIncident } from '@/features/incidents/lib/create-incident';
import type { CreateIncidentActionState } from '@/features/incidents/types/incident.types';

const initialError = 'Provide valid incident details before submitting.';

export async function createIncidentAction(
  _previousState: CreateIncidentActionState,
  formData: FormData,
): Promise<CreateIncidentActionState> {
  const parsed = createIncidentSchema.safeParse({
    locationId: formData.get('locationId'),
    title: formData.get('title'),
    summary: formData.get('summary'),
    customerName: formData.get('customerName'),
    severity: formData.get('severity'),
    reportedAt: formData.get('reportedAt'),
    assigneeUserId: formData.get('assigneeUserId'),
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
  const result = await createIncident(parsed.data, context);

  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_BRANCH_COOKIE_NAME, result.locationId, {
    sameSite: 'lax',
    path: '/',
    httpOnly: false,
    maxAge: ACTIVE_BRANCH_COOKIE_MAX_AGE_SECONDS,
  });

  revalidatePath('/dashboard');
  revalidatePath('/incidents');
  revalidatePath(`/incidents/${result.incidentId}`);
  redirect(`/incidents/${result.incidentId}`);
}
