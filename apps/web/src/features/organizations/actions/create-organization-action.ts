'use server';

import { getClientEnvResult } from '@pulseops/env/client';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-user';
import { createOrganizationSchema } from '../schemas/create-organization-schema';
import type { CreateOrganizationActionState } from '../types';
import { slugifyOrganizationName } from '@/lib/organizations/slugify-organization-name';

export async function createOrganizationAction(
  _previousState: CreateOrganizationActionState,
  formData: FormData,
): Promise<CreateOrganizationActionState> {
  const user = await requireUser();
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

  const supabase = await createSupabaseServerClient();
  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (organizationError) {
    return {
      error:
        organizationError.code === '23505'
          ? 'That workspace slug is already in use.'
          : organizationError.message,
    };
  }

  const { error: membershipError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: organization.id,
      user_id: user.id,
      role: 'owner',
    });

  if (membershipError) {
    return {
      error: membershipError.message,
    };
  }

  const { error: locationError } = await supabase.from('locations').insert({
    organization_id: organization.id,
    name: 'Head Office',
    code: 'HQ-001',
    timezone: 'UTC',
  });

  if (locationError) {
    return {
      error: locationError.message,
    };
  }

  redirect('/dashboard');
}
