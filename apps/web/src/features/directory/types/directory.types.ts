import type { Database } from '@pulseops/supabase/types';

export interface DirectorySearchInput {
  organizationId: string;
  locationId?: string | null;
  query?: string;
  limit?: number;
}

export interface DirectoryUser {
  userId: string;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  role: Database['public']['Enums']['organization_role'];
  isCurrentUser: boolean;
  locationId: string | null;
  locationName: string | null;
}
