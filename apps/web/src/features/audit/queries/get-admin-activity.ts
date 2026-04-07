import 'server-only';

import { redirect } from 'next/navigation';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { canViewAuditActivity } from '@/features/audit/lib/audit.permissions';
import {
  listAuditLogsFromDb,
  summarizeAuditLogs,
} from '@/features/audit/repositories/audit.repository';

export async function getAdminActivity() {
  const context = await requireTenantMember();

  if (!canViewAuditActivity(context.membershipRole)) {
    redirect('/dashboard');
  }

  const logs = await listAuditLogsFromDb(context.supabase, {
    tenantId: context.tenantId,
    limit: 100,
  });

  return {
    logs,
    summary: summarizeAuditLogs(logs),
    tenantName: context.tenantName,
  };
}
