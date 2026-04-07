import type { Route } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/empty-state';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { SavedListViewsBar } from '@/components/shared/saved-list-views-bar';
import { StatPill } from '@/components/shared/stat-pill';
import { IncidentFilters } from '@/components/incidents/incident-filters';
import { IncidentListTable } from '@/components/incidents/incident-list-table';
import { serializeIncidentListFilters } from '@/features/incidents/lib/incident-list-query-state';
import { canCreateIncidents } from '@/features/incidents/lib/incident-permissions';
import { getIncidentsList } from '@/features/incidents/queries/get-incidents-list';
import { parseIncidentListFilters } from '@/features/incidents/queries/parse-incident-list-filters';
import type { IncidentListFilters as SavedIncidentListFilters } from '@/features/incidents/types/incident.types';
import { getSavedListViewsFromDb } from '@/features/list-views/repositories/saved-list-views.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireTenantMember();
  const rawFilters = parseIncidentListFilters(await searchParams);
  const entitlements = await getOrganizationEntitlements(context.tenantId);
  const filters = entitlements.canUseAdvancedFilters
    ? rawFilters
    : {
        ...rawFilters,
        severity: 'all' as const,
        slaRisk: 'all' as const,
      };
  const incidents = await getIncidentsList({
    tenantId: context.tenantId,
    branchId: context.branchId,
    filters,
  });
  const savedViews = (await getSavedListViewsFromDb(
    context.supabase,
    {
      tenantId: context.tenantId,
      viewerId: context.viewerId,
      resourceType: 'incidents',
    },
  )).map((view) => {
    const viewFilters = view.filters as SavedIncidentListFilters;
    const query = serializeIncidentListFilters(viewFilters).toString();
    const currentQuery = serializeIncidentListFilters(filters).toString();

    return {
      id: view.id,
      name: view.name,
      resourceType: 'incidents' as const,
      filters: viewFilters,
      href: query ? `/incidents?${query}` : '/incidents',
      isActive: query === currentQuery,
    };
  });
  const canCreate = canCreateIncidents(context.membershipRole);
  const hasActiveFilters =
    Boolean(filters.q) ||
    filters.severity !== 'all' ||
    filters.status !== 'all' ||
    filters.slaRisk !== 'all';
  const atRiskCount = incidents.filter((incident) => incident.slaRisk).length;
  const activeCount = incidents.filter((incident) =>
    ['open', 'investigating', 'monitoring'].includes(incident.status),
  ).length;

  return (
    <main className="space-y-6">
      <ListPageHeader
        eyebrow={context.branchName ? `${context.branchName} branch` : context.tenantName}
        title="Incidents"
        description="Track active operational incidents, triage severity, and move from detection to resolution without leaving the protected PulseOps shell."
        actions={
          <>
            <StatPill label={`${String(incidents.length)} total`} />
            <StatPill label={`${String(activeCount)} active`} tone="warning" />
            <StatPill
              label={`${String(atRiskCount)} at risk`}
              tone={atRiskCount > 0 ? 'danger' : 'success'}
            />
            {canCreate ? (
              <Link
                href={'/incidents/new' as Route}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90"
              >
                New incident
              </Link>
            ) : null}
          </>
        }
      />

      <IncidentFilters
        filters={filters}
        canUseAdvancedFilters={entitlements.canUseAdvancedFilters}
      />
      <SavedListViewsBar
        resourceType="incidents"
        pageHref="/incidents"
        filtersPayload={JSON.stringify(filters)}
        views={savedViews}
        maxViews={entitlements.maxSavedViews}
      />

      {incidents.length > 0 ? (
        <IncidentListTable items={incidents} filters={filters} canManage={canCreate} />
      ) : hasActiveFilters ? (
        <EmptyState
          title="No incidents match this view"
          description="Try widening the filters or switching to another branch context from the shell if you need a broader operational picture."
          actionHref="/incidents"
          actionLabel="Clear filters"
        />
      ) : canCreate ? (
        <EmptyState
          title="No incidents match this view"
          description="Try widening the filters or switching to another branch context from the shell if you need a broader operational picture."
          actionHref={'/incidents/new' as Route}
          actionLabel="Create an incident"
        />
      ) : (
        <EmptyState
          title="No incidents match this view"
          description="Try widening the filters or switching to another branch context from the shell if you need a broader operational picture."
        />
      )}
    </main>
  );
}
