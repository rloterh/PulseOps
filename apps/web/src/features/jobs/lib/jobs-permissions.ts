import type { Database } from '@pulseops/supabase/types';

const CREATE_JOB_ROLES: Database['public']['Enums']['organization_role'][] = [
  'owner',
  'admin',
  'manager',
];

export function canCreateJobs(
  role: Database['public']['Enums']['organization_role'],
) {
  return CREATE_JOB_ROLES.includes(role);
}
