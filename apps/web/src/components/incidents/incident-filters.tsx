'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  DEFAULT_INCIDENT_LIST_FILTERS,
  serializeIncidentListFilters,
} from '@/features/incidents/lib/incident-list-query-state';
import type { IncidentListFilters } from '@/features/incidents/types/incident.types';

export function IncidentFilters({
  filters,
  canUseAdvancedFilters,
}: {
  filters: IncidentListFilters;
  canUseAdvancedFilters: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(filters.q ?? '');
  const [severity, setSeverity] = useState(
    filters.severity ?? DEFAULT_INCIDENT_LIST_FILTERS.severity,
  );
  const [status, setStatus] = useState(
    filters.status ?? DEFAULT_INCIDENT_LIST_FILTERS.status,
  );
  const [slaRisk, setSlaRisk] = useState(
    filters.slaRisk ?? DEFAULT_INCIDENT_LIST_FILTERS.slaRisk,
  );
  const debouncedQ = useDebouncedValue(q, 250);

  useEffect(() => {
    setQ(filters.q ?? '');
    setSeverity(filters.severity ?? DEFAULT_INCIDENT_LIST_FILTERS.severity);
    setStatus(filters.status ?? DEFAULT_INCIDENT_LIST_FILTERS.status);
    setSlaRisk(filters.slaRisk ?? DEFAULT_INCIDENT_LIST_FILTERS.slaRisk);
  }, [filters.q, filters.severity, filters.slaRisk, filters.status]);

  useEffect(() => {
    const nextSearchParams = serializeIncidentListFilters({
      q: debouncedQ,
      severity,
      status,
      slaRisk,
      sort: filters.sort ?? DEFAULT_INCIDENT_LIST_FILTERS.sort,
      direction: filters.direction ?? DEFAULT_INCIDENT_LIST_FILTERS.direction,
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
    router,
    searchParams,
    severity,
    slaRisk,
    status,
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
            Severity
          </span>
          <select
            name="severity"
            value={severity}
            onChange={(event) => {
              setSeverity(event.currentTarget.value as typeof severity);
            }}
            disabled={!canUseAdvancedFilters}
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
            value={status}
            onChange={(event) => {
              setStatus(event.currentTarget.value as typeof status);
            }}
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
            value={slaRisk}
            onChange={(event) => {
              setSlaRisk(event.currentTarget.value as typeof slaRisk);
            }}
            disabled={!canUseAdvancedFilters}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="all">All incidents</option>
            <option value="at-risk">At risk</option>
            <option value="healthy">Healthy</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-white/46">
            Search sync stays debounced while status changes update immediately so the list stays fast and shareable.
          </p>
          {!canUseAdvancedFilters ? (
            <p className="text-sm text-amber-100/80">
              Severity and SLA-health filters are available on paid plans.{' '}
              <Link href="/billing" className="font-semibold text-white underline-offset-4 hover:underline">
                Upgrade billing
              </Link>
              .
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            setQ('');
            setSeverity(DEFAULT_INCIDENT_LIST_FILTERS.severity);
            setStatus(DEFAULT_INCIDENT_LIST_FILTERS.status);
            setSlaRisk(DEFAULT_INCIDENT_LIST_FILTERS.slaRisk);
          }}
          className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
