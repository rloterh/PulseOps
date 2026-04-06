import type { Route } from 'next';
import Link from 'next/link';
import type { IncidentListItem } from '@/features/incidents/types/incident.types';
import { IncidentSeverityBadge } from './incident-severity-badge';
import { IncidentStatusBadge } from './incident-status-badge';

export function IncidentListTable({ items }: { items: IncidentListItem[] }) {
  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-white/8">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-white/40">
              <th className="px-5 py-4 font-medium">Incident</th>
              <th className="px-5 py-4 font-medium">Branch</th>
              <th className="px-5 py-4 font-medium">Severity</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Owner</th>
              <th className="px-5 py-4 font-medium">Opened</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6 text-sm">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-white/[0.03]">
                <td className="px-5 py-4 align-top">
                  <Link href={`/incidents/${item.id}` as Route} className="block">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                      {item.reference} / {item.siteName}
                    </p>
                  </Link>
                </td>
                <td className="px-5 py-4 align-top text-white/68">{item.branchName}</td>
                <td className="px-5 py-4 align-top">
                  <IncidentSeverityBadge severity={item.severity} />
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    <IncidentStatusBadge status={item.status} />
                    <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                      {item.slaRisk ? 'SLA at risk' : 'Within SLA'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 align-top text-white/68">
                  <p>{item.ownerName}</p>
                  <p className="mt-1 text-xs text-white/42">
                    {item.assigneeName ?? 'Unassigned'}
                  </p>
                </td>
                <td className="px-5 py-4 align-top text-white/68">{item.openedAtLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/incidents/${item.id}` as Route}
            className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4 transition hover:bg-black/26"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                  {item.reference} / {item.siteName}
                </p>
              </div>
              <IncidentSeverityBadge severity={item.severity} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <IncidentStatusBadge status={item.status} />
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/60">
                {item.branchName}
              </span>
            </div>
            <p className="mt-4 text-sm text-white/52">
              Owner: {item.ownerName} / {item.assigneeName ?? 'Unassigned'}
            </p>
            <p className="mt-2 text-xs text-white/42">{item.openedAtLabel}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
