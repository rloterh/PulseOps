import type { Database } from '@pulseops/supabase/types';

export interface AppNavItem {
  label: string;
  href: string;
  icon:
    | 'dashboard'
    | 'branches'
    | 'incidents'
    | 'jobs'
    | 'tasks'
    | 'customers'
    | 'team'
    | 'inbox'
    | 'settings';
  match?: 'exact' | 'startsWith';
  badgeCount?: number;
}

export interface BranchOption {
  id: string;
  name: string;
  code: string | null;
  timezone: string | null;
  locationLabel: string | null;
  isActive?: boolean;
}

export interface ShellViewer {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: Database['public']['Enums']['organization_role'];
}

export interface AppShellContext {
  tenantId: string;
  tenantName: string;
  activeBranchId: string | null;
  activeBranchName: string | null;
  viewer: ShellViewer;
  branches: BranchOption[];
}
