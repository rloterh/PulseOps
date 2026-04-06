import Link from 'next/link';
import type { IncidentListFilters } from '@/features/incidents/types/incident.types';

export function IncidentFilters({ filters }: { filters: IncidentListFilters }) {
  return (
    <form
      className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.24)]"
      method="get"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.6fr))]">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-white/44">
            Search
          </span>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ''}
            placeholder="Search title, reference, site, or customer"
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/30"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-white/44">
            Severity
          </span>
          <select
            name="severity"
            defaultValue={filters.severity ?? 'all'}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-white/44">
            Status
          </span>
          <select
            name="status"
            defaultValue={filters.status ?? 'all'}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-white/44">
            SLA health
          </span>
          <select
            name="slaRisk"
            defaultValue={filters.slaRisk ?? 'all'}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="all">All incidents</option>
            <option value="at-risk">At risk</option>
            <option value="healthy">Healthy</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/46">
          Filters stay server-rendered so the page remains branch-aware and shareable.
        </p>
        <div className="flex gap-2">
          <Link
            href="/incidents"
            className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white"
          >
            Reset
          </Link>
          <button
            type="submit"
            className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:opacity-90"
          >
            Apply filters
          </button>
        </div>
      </div>
    </form>
  );
}
