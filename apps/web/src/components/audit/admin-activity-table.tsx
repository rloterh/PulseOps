'use client';

import { useEffect, useState } from 'react';
import { AdminActivityDrawer } from '@/components/audit/admin-activity-drawer';
import { AdminActivityPagination } from '@/components/audit/admin-activity-pagination';
import type { AuditActivityPagination, AuditLogListItem } from '@/features/audit/types/audit.types';

export function AdminActivityTable({
  logs,
  pagination,
  previousHref,
  nextHref,
}: {
  logs: AuditLogListItem[];
  pagination: AuditActivityPagination;
  previousHref: string;
  nextHref: string;
}) {
  const [selectedLogId, setSelectedLogId] = useState(logs[0]?.id ?? null);

  useEffect(() => {
    setSelectedLogId(logs[0]?.id ?? null);
  }, [logs]);

  if (!logs.length) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
        <h2 className="text-lg font-semibold text-white">No admin activity yet</h2>
        <p className="mt-3 text-sm leading-6 text-white/56">
          Audit rows will appear here once sensitive incident, escalation, billing, or
          operator actions begin writing into the append-only activity stream.
        </p>
      </section>
    );
  }

  const selectedLog = logs.find((log) => log.id === selectedLogId) ?? logs[0] ?? null;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.04]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/72">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/45">
                <tr>
                  <th className="px-5 py-4 font-medium">Action</th>
                  <th className="px-5 py-4 font-medium">Actor</th>
                  <th className="px-5 py-4 font-medium">Entity</th>
                  <th className="px-5 py-4 font-medium">Scope</th>
                  <th className="px-5 py-4 font-medium">Branch</th>
                  <th className="px-5 py-4 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className={`cursor-pointer border-t border-white/6 align-top transition ${
                      selectedLog?.id === log.id ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                    }`}
                    onClick={() => {
                      setSelectedLogId(log.id);
                    }}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{log.actionLabel}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                        {log.action}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white">{log.actorName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/42">
                        {log.actorType}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white">{log.entityLabel ?? 'Unknown entity'}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/42">
                        {log.entityType}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-white/58">{log.scope ?? 'system'}</td>
                    <td className="px-5 py-4 text-white/58">
                      {log.locationName ?? 'All branches'}
                    </td>
                    <td className="px-5 py-4 text-white/58">{log.createdAtLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-white/45">
          <p>
            Showing {(pagination.page - 1) * pagination.pageSize + 1}-
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} events
          </p>
          <AdminActivityPagination
            hasPrevious={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            previousHref={previousHref}
            nextHref={nextHref}
          />
        </div>
      </div>
      <AdminActivityDrawer log={selectedLog} />
    </section>
  );
}
