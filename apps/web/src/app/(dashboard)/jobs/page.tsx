import { EmptyState } from '@/components/shared/empty-state';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { StatPill } from '@/components/shared/stat-pill';
import { JobFilters } from '@/components/jobs/job-filters';
import { JobListTable } from '@/components/jobs/job-list-table';
import { getJobsList } from '@/features/jobs/queries/get-jobs-list';
import { parseJobListFilters } from '@/features/jobs/queries/parse-job-list-filters';
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
          </>
        }
      />

      <JobFilters filters={filters} />

      {jobs.length > 0 ? (
        <JobListTable items={jobs} />
      ) : (
        <EmptyState
          title="No jobs match this view"
          description="Try widening the filters or switching branch context if you want to see work queued for another operating location."
          actionHref="/jobs"
          actionLabel="Clear filters"
        />
      )}
    </main>
  );
}
