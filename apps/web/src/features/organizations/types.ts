import type { Database } from '@pulseops/supabase/types';

export interface CreateOrganizationActionState {
  error?: string;
}

export interface OrganizationContext {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface CurrentMembership {
  id: string;
  organization_id: string;
  role: Database['public']['Enums']['organization_role'];
  organization: OrganizationContext;
}
