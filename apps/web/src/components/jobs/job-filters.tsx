import Link from 'next/link';
import type { JobListFilters } from '@/features/jobs/types/job.types';

export function JobFilters({ filters }: { filters: JobListFilters }) {
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
            Priority
          </span>
          <select
            name="priority"
            defaultValue={filters.priority ?? 'all'}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
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
            <option value="new">New</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-white/44">
            Type
          </span>
          <select
            name="type"
            defaultValue={filters.type ?? 'all'}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="all">All types</option>
            <option value="reactive">Reactive</option>
            <option value="preventive">Preventive</option>
            <option value="inspection">Inspection</option>
            <option value="vendor">Vendor</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/46">
          Filters remain URL-driven so dispatch and triage views are easy to share.
        </p>
        <div className="flex gap-2">
          <Link
            href="/jobs"
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
