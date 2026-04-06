'use client';

import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  DEFAULT_JOB_LIST_FILTERS,
  serializeJobListFilters,
} from '@/features/jobs/lib/job-list-query-state';
import type { JobListFilters } from '@/features/jobs/types/job.types';

export function JobFilters({ filters }: { filters: JobListFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(filters.q ?? '');
  const [priority, setPriority] = useState(
    filters.priority ?? DEFAULT_JOB_LIST_FILTERS.priority,
  );
  const [status, setStatus] = useState(
    filters.status ?? DEFAULT_JOB_LIST_FILTERS.status,
  );
  const [type, setType] = useState(filters.type ?? DEFAULT_JOB_LIST_FILTERS.type);
  const debouncedQ = useDebouncedValue(q, 250);

  useEffect(() => {
    setQ(filters.q ?? '');
    setPriority(filters.priority ?? DEFAULT_JOB_LIST_FILTERS.priority);
    setStatus(filters.status ?? DEFAULT_JOB_LIST_FILTERS.status);
    setType(filters.type ?? DEFAULT_JOB_LIST_FILTERS.type);
  }, [filters.q, filters.priority, filters.status, filters.type]);

  useEffect(() => {
    const nextSearchParams = serializeJobListFilters({
      q: debouncedQ,
      priority,
      status,
      type,
      sort: filters.sort ?? DEFAULT_JOB_LIST_FILTERS.sort,
      direction: filters.direction ?? DEFAULT_JOB_LIST_FILTERS.direction,
    });
    const nextQuery = nextSearchParams.toString();

    if (nextQuery === searchParams.toString()) {
      return;
    }

    const href = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(href as Route, { scroll: false });
  }, [
    debouncedQ,
    filters.direction,
    filters.sort,
    pathname,
    priority,
    router,
    searchParams,
    status,
    type,
  ]);

  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.6fr))]">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-white/44">
            Search
          </span>
          <input
            type="search"
            name="q"
            value={q}
            onChange={(event) => {
              setQ(event.currentTarget.value);
            }}
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
            value={priority}
            onChange={(event) => {
              setPriority(event.currentTarget.value as typeof priority);
            }}
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
            value={status}
            onChange={(event) => {
              setStatus(event.currentTarget.value as typeof status);
            }}
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
            value={type}
            onChange={(event) => {
              setType(event.currentTarget.value as typeof type);
            }}
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
          Search sync is debounced, while priority, status, and type changes update the URL immediately for faster triage.
        </p>
        <button
          type="button"
          onClick={() => {
            setQ('');
            setPriority(DEFAULT_JOB_LIST_FILTERS.priority);
            setStatus(DEFAULT_JOB_LIST_FILTERS.status);
            setType(DEFAULT_JOB_LIST_FILTERS.type);
          }}
          className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
