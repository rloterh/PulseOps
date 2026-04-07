'use server';

import { getClientEnvResult } from '@pulseops/env/client';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-user';
import { getCurrentMembership } from '@/lib/organizations/get-current-membership';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import { createOrganizationSchema } from '../schemas/create-organization-schema';
import type { CreateOrganizationActionState } from '../types';
import { slugifyOrganizationName } from '@/lib/organizations/slugify-organization-name';

export async function createOrganizationAction(
  _previousState: CreateOrganizationActionState,
  formData: FormData,
): Promise<CreateOrganizationActionState> {
  const user = await requireUser();

  if (
    await isServerActionRateLimited({
      bucket: 'organization:create',
      actorId: user.id,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many workspace setup attempts. Please wait a moment and try again.',
    };
  }

  const rawSlug = formData.get('slug');
  const parsed = createOrganizationSchema.safeParse({
    name: formData.get('name'),
    slug: slugifyOrganizationName(typeof rawSlug === 'string' ? rawSlug : ''),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Invalid workspace details.',
    };
  }

  if (!getClientEnvResult().success) {
    return {
      error:
        'Supabase is not configured yet. Add your local environment values before onboarding a workspace.',
    };
  }

  const existingMembership = await getCurrentMembership(user.id);

  if (existingMembership) {
    redirect('/dashboard');
  }

  const supabase = await createSupabaseServerClient();
  const { error: organizationError } = await supabase.rpc(
    'bootstrap_organization',
    {
      org_name: parsed.data.name,
      org_slug: parsed.data.slug,
      default_location_name: 'Head Office',
      default_location_code: 'HQ-001',
      default_location_timezone: 'UTC',
    },
  );

  if (organizationError) {
    if (organizationError.message.includes('You already belong to a workspace')) {
      redirect('/dashboard');
    }

    return {
      error:
        organizationError.code === '23505'
          ? 'That workspace slug is already in use.'
          : 'We could not create that workspace right now. Please try again.',
    };
  }

  redirect('/dashboard');
}
