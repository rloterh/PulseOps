import type { OrganizationRole } from '@/features/collaboration/types/collaboration.types';

export function canUseInternalNotes(role: OrganizationRole) {
  return ['owner', 'admin', 'manager'].includes(role);
}

export function canDeleteRecordComment(
  viewerId: string,
  authorUserId: string,
  role: OrganizationRole,
) {
  return viewerId === authorUserId || canUseInternalNotes(role);
}
