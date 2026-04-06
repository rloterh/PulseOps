import type { Route } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/empty-state';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { SavedListViewsBar } from '@/components/shared/saved-list-views-bar';
import { StatPill } from '@/components/shared/stat-pill';
import { JobFilters } from '@/components/jobs/job-filters';
import { JobListTable } from '@/components/jobs/job-list-table';
import { serializeJobListFilters } from '@/features/jobs/lib/job-list-query-state';
import { canCreateJobs } from '@/features/jobs/lib/jobs-permissions';
import { getJobsList } from '@/features/jobs/queries/get-jobs-list';
import { parseJobListFilters } from '@/features/jobs/queries/parse-job-list-filters';
import type { JobListFilters as SavedJobListFilters } from '@/features/jobs/types/job.types';
import { getSavedListViewsFromDb } from '@/features/list-views/repositories/saved-list-views.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireTenantMember();
  const filters = parseJobListFilters(await searchParams);
  const jobs = await getJobsList({
    tenantId: context.tenantId,
    branchId: context.branchId,
    filters,
  });
  const savedViews = (await getSavedListViewsFromDb(
    context.supabase,
    {
      tenantId: context.tenantId,
      viewerId: context.viewerId,
      resourceType: 'jobs',
    },
  )).map((view) => {
    const viewFilters = view.filters as SavedJobListFilters;
    const query = serializeJobListFilters(viewFilters).toString();
    const currentQuery = serializeJobListFilters(filters).toString();

    return {
      id: view.id,
      name: view.name,
      resourceType: 'jobs' as const,
      filters: viewFilters,
      href: query ? `/jobs?${query}` : '/jobs',
      isActive: query === currentQuery,
    };
  });
  const canCreate = canCreateJobs(context.membershipRole);
  const hasActiveFilters =
    Boolean(filters.q) ||
    filters.priority !== 'all' ||
    filters.status !== 'all' ||
    filters.type !== 'all';
  const inFlightCount = jobs.filter((job) =>
    ['new', 'scheduled', 'in_progress', 'blocked'].includes(job.status),
  ).length;
  const linkedIncidentCount = jobs.filter((job) => job.linkedIncidentId).length;

  return (
    <main className="space-y-6">
      <ListPageHeader
        eyebrow={context.branchName ? `${context.branchName} branch` : context.tenantName}
        title="Jobs"
        description="Coordinate reactive and preventive work, manage assignment flow, and keep operational execution visible inside the same branch-aware shell."
        actions={
          <>
            <StatPill label={`${String(jobs.length)} total`} />
            <StatPill label={`${String(inFlightCount)} in flight`} tone="warning" />
            <StatPill
              label={`${String(linkedIncidentCount)} linked to incidents`}
              tone={linkedIncidentCount > 0 ? 'success' : 'default'}
            />
            {canCreate ? (
              <Link
                href="/jobs/new"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90"
              >
                New job
              </Link>
            ) : null}
          </>
        }
      />

      <JobFilters filters={filters} />
      <SavedListViewsBar
        resourceType="jobs"
        pageHref="/jobs"
        filtersPayload={JSON.stringify(filters)}
        views={savedViews}
      />

      {jobs.length > 0 ? (
        <JobListTable items={jobs} filters={filters} canManage={canCreate} />
      ) : hasActiveFilters ? (
        <EmptyState
          title="No jobs match this view"
          description="Try widening the filters or switching branch context if you want to see work queued for another operating location."
          actionHref="/jobs"
          actionLabel="Clear filters"
        />
      ) : canCreate ? (
        <EmptyState
          title="No jobs match this view"
          description="Try widening the filters or switching branch context if you want to see work queued for another operating location."
          actionHref={'/jobs/new' as Route}
          actionLabel="Create a job"
        />
      ) : (
        <EmptyState
          title="No jobs match this view"
          description="Try widening the filters or switching branch context if you want to see work queued for another operating location."
        />
      )}
    </main>
  );
}
