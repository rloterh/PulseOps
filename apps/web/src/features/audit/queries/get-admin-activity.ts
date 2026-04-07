import 'server-only';

import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { canViewAuditActivity } from '@/features/audit/lib/audit.permissions';
import { parseAdminActivityFilters } from '@/features/audit/lib/parse-admin-activity-filters';
import {
  getAuditActivityFilterOptionsFromDb,
  listAuditLogsFromDb,
  summarizeAuditLogs,
} from '@/features/audit/repositories/audit.repository';

export async function getAdminActivity(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const context = await requireTenantMember();

  if (!canViewAuditActivity(context.membershipRole)) {
    redirect('/dashboard');
  }

  const filterOptions = await getAuditActivityFilterOptionsFromDb(context.supabase, {
    tenantId: context.tenantId,
  });
  const filters = parseAdminActivityFilters(searchParams, filterOptions);
  const logs = await listAuditLogsFromDb(context.supabase, {
    tenantId: context.tenantId,
    limit: 100,
    filters,
  });

  return {
    logs,
    summary: summarizeAuditLogs(logs),
    tenantName: context.tenantName,
    filters,
    filterOptions,
  };
}
