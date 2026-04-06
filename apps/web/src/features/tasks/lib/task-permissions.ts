import type { Database } from '@pulseops/supabase/types';

export function canCreateTasks(role: Database['public']['Enums']['organization_role']) {
  return ['owner', 'admin', 'manager', 'agent'].includes(role);
}
