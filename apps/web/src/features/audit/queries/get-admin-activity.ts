import 'server-only';

import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { canViewAuditActivity } from '@/features/audit/lib/audit.permissions';
import { parseAdminActivityFilters } from '@/features/audit/lib/parse-admin-activity-filters';
import { parseAdminActivityPage } from '@/features/audit/lib/parse-admin-activity-page';
import {
  buildAuditPagination,
  getAuditActivityFilterOptionsFromDb,
  insertAuditLogInDb,
  listAuditLogsFromDb,
  summarizeAuditLogs,
} from '@/features/audit/repositories/audit.repository';

export async function getAdminActivity(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const pageSize = 20;
  const context = await requireTenantMember();

  if (!canViewAuditActivity(context.membershipRole)) {
    redirect('/dashboard');
  }

  const filterOptions = await getAuditActivityFilterOptionsFromDb(context.supabase, {
    tenantId: context.tenantId,
  });
  const filters = parseAdminActivityFilters(searchParams, filterOptions);
  const page = parseAdminActivityPage(searchParams);
  const { logs, total } = await listAuditLogsFromDb(context.supabase, {
    tenantId: context.tenantId,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    filters,
  });
  const pagination = buildAuditPagination({ page, pageSize, total });

  await insertAuditLogInDb(context.supabase, {
    tenantId: context.tenantId,
    locationId: context.branchId,
    actorUserId: context.viewerId,
    action: 'admin.audit_viewed',
    entityType: 'audit_logs',
    entityLabel: 'Admin Activity',
    scope: 'admin',
    metadata: {
      page,
      pageSize,
      viewedCount: logs.length,
      total,
      filters: {
        q: filters.q,
        scope: filters.scope,
        actorUserId: filters.actorUserId,
        entityType: filters.entityType,
        locationId: filters.locationId,
      },
    },
  });

  return {
    logs,
    summary: {
      ...summarizeAuditLogs(logs),
      total,
    },
    tenantName: context.tenantName,
    filters,
    filterOptions,
    pagination,
  };
}
