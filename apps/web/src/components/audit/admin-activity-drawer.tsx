import type { AuditLogListItem } from '@/features/audit/types/audit.types';

export function AdminActivityDrawer({
  log,
}: {
  log: AuditLogListItem | null;
}) {
  return (
    <aside
      aria-labelledby="admin-activity-drawer-title"
      className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5"
      role="region"
    >
      <div className="border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/72">
          Activity details
        </p>
        <h2 id="admin-activity-drawer-title" className="mt-3 text-lg font-semibold tracking-tight text-white">
          {log?.actionLabel ?? 'Select an activity row'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/52">
          {log
            ? 'Inspect the exact actor, target, and structured metadata behind this audit event.'
            : 'Choose an audit event from the table to inspect its metadata and request context.'}
        </p>
      </div>

      {log ? (
        <dl className="mt-5 space-y-4 text-sm">
          <DetailRow label="Action" value={log.action} />
          <DetailRow label="Actor" value={log.actorName} />
          <DetailRow label="Entity" value={log.entityLabel ?? log.entityType} />
          <DetailRow label="Entity id" value={log.entityId ?? 'Not captured'} />
          <DetailRow label="Scope" value={log.scope ?? 'system'} />
          <DetailRow label="Branch" value={log.locationName ?? 'All branches'} />
          <DetailRow label="When" value={log.createdAtLabel} />
          <DetailRow label="Request id" value={log.requestId ?? 'Not captured'} />
          <DetailRow label="IP address" value={log.ipAddress ?? 'Not captured'} />
          <DetailRow label="User agent" value={log.userAgent ?? 'Not captured'} />
          <div>
            <dt className="text-white/42">Metadata</dt>
            <dd className="mt-2 overflow-x-auto rounded-[1rem] border border-white/8 bg-black/20 p-3 text-xs leading-6 text-white/68">
              <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
            </dd>
          </div>
        </dl>
      ) : null}
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/42">{label}</dt>
      <dd className="mt-1 font-medium text-white">{value}</dd>
    </div>
  );
}
