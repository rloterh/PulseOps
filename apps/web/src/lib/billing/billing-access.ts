import type { Database } from '@pulseops/supabase/types';

export function canManageBilling(
  role: Database['public']['Enums']['organization_role'],
) {
  return role === 'owner' || role === 'admin';
}
