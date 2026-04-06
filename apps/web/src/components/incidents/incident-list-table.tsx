'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ListViewControls } from '@/components/shared/list-view-controls';
import type {
  IncidentListFilters,
  IncidentListItem,
  IncidentListSortField,
} from '@/features/incidents/types/incident.types';
import {
  getIncidentListSortDirection,
  serializeIncidentListFilters,
  toggleIncidentListSort,
} from '@/features/incidents/lib/incident-list-query-state';
import type { ListViewPreferenceOptions } from '@/features/operations-list/lib/list-view-preferences';
import { useRecordRowOpen } from '@/hooks/use-record-row-open';
import { usePersistentListViewPreferences } from '@/hooks/use-persistent-list-view-preferences';
import { IncidentSeverityBadge } from './incident-severity-badge';
import { IncidentStatusBadge } from './incident-status-badge';

type IncidentListColumn = 'branch' | 'severity' | 'status' | 'owner' | 'opened';

const INCIDENT_LIST_COLUMNS: readonly {
  id: IncidentListColumn;
  label: string;
}[] = [
  { id: 'branch', label: 'Branch' },
  { id: 'severity', label: 'Severity' },
  { id: 'status', label: 'Status' },
  { id: 'owner', label: 'Owner' },
  { id: 'opened', label: 'Opened' },
];

const INCIDENT_LIST_PREFERENCE_OPTIONS: ListViewPreferenceOptions<IncidentListColumn> =
  {
    allowedColumns: INCIDENT_LIST_COLUMNS.map((column) => column.id),
    defaultVisibleColumns: INCIDENT_LIST_COLUMNS.map((column) => column.id),
    defaultPageSize: 25,
  };

function SortHeaderButton({
  label,
  field,
  filters,
}: {
  label: string;
  field: IncidentListSortField;
  filters: IncidentListFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const direction = getIncidentListSortDirection(filters, field);

  return (
    <button
      type="button"
      onClick={() => {
        const next = serializeIncidentListFilters(
          toggleIncidentListSort(filters, field),
        );
        const nextQuery = next.toString();

        if (nextQuery === searchParams.toString()) {
          return;
        }

        const href = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.replace(href as Route, { scroll: false });
      }}
      className="inline-flex items-center gap-2 text-white/56 transition hover:text-white"
    >
      <span>{label}</span>
      {direction ? (
        <span className="text-[10px] tracking-[0.12em] text-white/32">
          {direction === 'asc' ? 'ASC' : 'DESC'}
        </span>
      ) : null}
    </button>
  );
}

export function IncidentListTable({
  items,
  filters,
}: {
  items: IncidentListItem[];
  filters: IncidentListFilters;
}) {
  const { openRecord } = useRecordRowOpen();
  const { preferences, setDensity, setPageSize, toggleColumn } =
    usePersistentListViewPreferences(
      'pulseops:list-view:incidents',
      INCIDENT_LIST_PREFERENCE_OPTIONS,
    );
  const visibleItems =
    preferences.pageSize === 'all'
      ? items
      : items.slice(0, preferences.pageSize);
  const compactRows = preferences.density === 'compact';
  const rowPaddingClass = compactRows ? 'px-5 py-3' : 'px-5 py-4';
  const cardPaddingClass = compactRows ? 'p-3.5' : 'p-4';
  const visibleColumns = preferences.visibleColumns;
  const showBranch = visibleColumns.includes('branch');
  const showSeverity = visibleColumns.includes('severity');
  const showStatus = visibleColumns.includes('status');
  const showOwner = visibleColumns.includes('owner');
  const showOpened = visibleColumns.includes('opened');

  function openIncident(
    event: MouseEvent<HTMLTableRowElement> | KeyboardEvent<HTMLTableRowElement>,
    incidentId: string,
  ) {
    const target = event.target as HTMLElement;
    const interactiveTarget = target.closest('button, input, a, select, textarea');

    if (interactiveTarget) {
      return;
    }

    const href = `/incidents/${incidentId}` as Route;
    const newTab =
      'metaKey' in event
        ? event.metaKey || event.ctrlKey
        : false;

    openRecord(href, { newTab });
  }

  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
      <ListViewControls
        itemLabel="incidents"
        visibleCount={visibleItems.length}
        totalCount={items.length}
        density={preferences.density}
        onDensityChange={setDensity}
        pageSize={preferences.pageSize}
        onPageSizeChange={setPageSize}
        columns={INCIDENT_LIST_COLUMNS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
      />

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-white/8">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-white/40">
              <th className="px-5 py-4 font-medium">
                <SortHeaderButton
                  label="Incident"
                  field="title"
                  filters={filters}
                />
              </th>
              {showBranch ? (
                <th className="px-5 py-4 font-medium">Branch</th>
              ) : null}
              {showSeverity ? (
                <th className="px-5 py-4 font-medium">
                  <SortHeaderButton
                    label="Severity"
                    field="severity"
                    filters={filters}
                  />
                </th>
              ) : null}
              {showStatus ? (
                <th className="px-5 py-4 font-medium">
                  <SortHeaderButton label="Status" field="status" filters={filters} />
                </th>
              ) : null}
              {showOwner ? (
                <th className="px-5 py-4 font-medium">Owner</th>
              ) : null}
              {showOpened ? (
                <th className="px-5 py-4 font-medium">
                  <SortHeaderButton
                    label="Opened"
                    field="opened_at"
                    filters={filters}
                  />
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6 text-sm">
            {visibleItems.map((item) => (
              <tr
                key={item.id}
                tabIndex={0}
                onClick={(event) => {
                  openIncident(event, item.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openIncident(event, item.id);
                  }
                }}
                className="cursor-pointer transition hover:bg-white/[0.03] focus-visible:bg-white/[0.05] focus-visible:outline-none"
              >
                <td className={`${rowPaddingClass} align-top`}>
                  <div className="block">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                      {item.reference} / {item.siteName}
                    </p>
                  </div>
                </td>
                {showBranch ? (
                  <td className={`${rowPaddingClass} align-top text-white/68`}>
                    {item.branchName}
                  </td>
                ) : null}
                {showSeverity ? (
                  <td className={`${rowPaddingClass} align-top`}>
                    <IncidentSeverityBadge severity={item.severity} />
                  </td>
                ) : null}
                {showStatus ? (
                  <td className={`${rowPaddingClass} align-top`}>
                    <div className="flex flex-col gap-2">
                      <IncidentStatusBadge status={item.status} />
                      <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                        {item.slaRisk ? 'SLA at risk' : 'Within SLA'}
                      </span>
                    </div>
                  </td>
                ) : null}
                {showOwner ? (
                  <td className={`${rowPaddingClass} align-top text-white/68`}>
                    <p>{item.ownerName}</p>
                    <p className="mt-1 text-xs text-white/42">
                      {item.assigneeName ?? 'Unassigned'}
                    </p>
                  </td>
                ) : null}
                {showOpened ? (
                  <td className={`${rowPaddingClass} align-top text-white/68`}>
                    {item.openedAtLabel}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            href={`/incidents/${item.id}` as Route}
            className={`rounded-[1.4rem] border border-white/8 bg-black/18 transition hover:bg-black/26 ${cardPaddingClass}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                  {item.reference} / {item.siteName}
                </p>
              </div>
              {showSeverity ? (
                <IncidentSeverityBadge severity={item.severity} />
              ) : null}
            </div>
            {(showStatus || showBranch) ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {showStatus ? <IncidentStatusBadge status={item.status} /> : null}
                {showBranch ? (
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/60">
                    {item.branchName}
                  </span>
                ) : null}
              </div>
            ) : null}
            {showOwner ? (
              <p className="mt-4 text-sm text-white/52">
                Owner: {item.ownerName} / {item.assigneeName ?? 'Unassigned'}
              </p>
            ) : null}
            {showOpened ? (
              <p className="mt-2 text-xs text-white/42">{item.openedAtLabel}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
