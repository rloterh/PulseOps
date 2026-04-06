import type { Route } from 'next';
import Link from 'next/link';
import type { IncidentDetail } from '@/features/incidents/types/incident.types';
import { IncidentSeverityBadge } from './incident-severity-badge';
import { IncidentStatusBadge } from './incident-status-badge';

export function IncidentDetailHeader({ incident }: { incident: IncidentDetail }) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(17,24,39,0.9),rgba(127,29,29,0.16))] px-6 py-7 shadow-[0_28px_90px_rgba(2,6,23,0.32)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <IncidentSeverityBadge severity={incident.severity} />
            <IncidentStatusBadge status={incident.status} />
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/56">
              {incident.reference}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/72">
              {incident.branchName}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {incident.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
              {incident.summary}
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.6rem] border border-white/8 bg-black/16 p-4 text-sm xl:min-w-[18rem]">
          <DetailRow label="Site" value={incident.siteName} />
          <DetailRow label="Customer" value={incident.customerName} />
          <DetailRow label="Owner" value={incident.ownerName} />
          <DetailRow label="Assignee" value={incident.assigneeName ?? 'Unassigned'} />
          <DetailRow label="Opened" value={incident.openedAtLabel} />
          <div>
            <dt className="text-white/42">Linked jobs</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {incident.linkedJobs.length > 0 ? (
                incident.linkedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}` as Route}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/72 transition hover:bg-white/10 hover:text-white"
                  >
                    {job.reference}
                  </Link>
                ))
              ) : (
                <span className="text-white/56">No linked jobs</span>
              )}
            </dd>
          </div>
        </div>
      </div>
    </section>
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
