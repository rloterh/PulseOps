import type { Database } from '@pulseops/supabase/types';

type OrganizationRole = Database['public']['Enums']['organization_role'];

export function canViewAnalytics(role: OrganizationRole) {
  return role === 'owner' || role === 'admin' || role === 'manager';
}
