import type { Database } from '@pulseops/supabase/types';

type OrganizationRole = Database['public']['Enums']['organization_role'];

export function canManageIncidentEscalations(role: OrganizationRole) {
  return ['owner', 'admin', 'manager'].includes(role);
}

export function canAcknowledgeIncidentEscalation(input: {
  role: OrganizationRole;
  viewerId: string;
  targetUserId: string | null;
}) {
  return canManageIncidentEscalations(input.role) || input.targetUserId === input.viewerId;
}
