import type { Route } from 'next';
import Link from 'next/link';
import type { JobDetail } from '@/features/jobs/types/job.types';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { JobPriorityBadge } from './job-priority-badge';
import { JobStatusBadge } from './job-status-badge';

export function JobDetailHeader({ job }: { job: JobDetail }) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(17,24,39,0.9),rgba(14,116,144,0.14))] px-6 py-7 shadow-[0_28px_90px_rgba(2,6,23,0.32)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <JobPriorityBadge priority={job.priority} />
            <JobStatusBadge status={job.status} />
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/56">
              {job.reference}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/72">
              {job.branchName}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {job.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
              {job.summary}
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.6rem] border border-white/8 bg-black/16 p-4 text-sm xl:min-w-[18rem]">
          <Link
            href={`/jobs/${job.id}/edit` as Route}
            className="inline-flex justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Edit job
          </Link>
          <DetailRow label="Site" value={job.siteName} />
          <DetailRow label="Customer" value={job.customerName} />
          <DetailRow label="Assignee" value={job.assigneeName ?? 'Unassigned'} />
          <DetailRow label="Type" value={formatTokenLabel(job.type)} />
          <DetailRow label="Due" value={job.dueAtLabel} />
          <div>
            <dt className="text-white/42">Linked incident</dt>
            <dd className="mt-2">
              {job.linkedIncident ? (
                <Link
                  href={`/incidents/${job.linkedIncident.id}` as Route}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/72 transition hover:bg-white/10 hover:text-white"
                >
                  {job.linkedIncident.reference}
                </Link>
              ) : (
                <span className="text-white/56">No linked incident</span>
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
