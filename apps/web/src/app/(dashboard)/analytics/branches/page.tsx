import Link from 'next/link';
import { AnalyticsBarList } from '@/components/analytics/analytics-bar-list';
import { BranchComparisonTable } from '@/components/analytics/branch-comparison-table';
import { AnalyticsFiltersBar } from '@/components/analytics/analytics-filters';
import { AnalyticsPageShell } from '@/components/analytics/analytics-page-shell';
import { EmptyAnalyticsState } from '@/components/analytics/empty-analytics-state';
import { canViewAnalytics } from '@/features/analytics/lib/analytics.permissions';
import { buildAnalyticsExportHref } from '@/features/analytics/lib/build-analytics-export-href';
import { resolveAnalyticsDateRange } from '@/features/analytics/lib/date-range';
import { resolveAnalyticsScope } from '@/features/analytics/lib/resolve-analytics-scope';
import { getAnalyticsBranchComparison } from '@/features/analytics/queries/get-analytics-branch-comparison';
import { parseAnalyticsFilters } from '@/features/analytics/schemas/analytics-filters.schema';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { redirect } from 'next/navigation';

export default async function AnalyticsBranchComparisonPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireTenantMember();

  if (!canViewAnalytics(context.membershipRole)) {
    redirect('/dashboard');
  }

  const entitlements = await getOrganizationEntitlements(context.tenantId);
  const { data: locations, error } = await context.supabase
    .from('locations')
    .select('id, name')
    .eq('organization_id', context.tenantId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const parsedFilters = parseAnalyticsFilters(await searchParams);
  const { filters } = resolveAnalyticsScope({
    filters: parsedFilters,
    locations,
    shellBranchId: context.branchId,
  });
  const range = resolveAnalyticsDateRange(filters);

  if (!entitlements.canUseAnalytics) {
    return (
      <main className="space-y-6">
        <section className="rounded-[2rem] border border-amber-400/20 bg-amber-300/10 px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">
            Analytics
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Branch comparison is locked on the current billing plan.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
            Upgrade the workspace to compare branch throughput, backlog, incidents,
            and SLA performance side by side.
          </p>
          <div className="mt-6">
            <Link
              href="/billing"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90"
            >
              Open billing
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const data = await getAnalyticsBranchComparison({
    tenantId: context.tenantId,
    filters,
    range,
    branches: locations,
  });
  const exportHref = buildAnalyticsExportHref({
    dataset: 'branches',
    filters,
  });

  return (
    <AnalyticsPageShell
      title="Branch comparison"
      subtitle="Compare how each branch is handling volume, backlog pressure, incidents, and service outcomes in the same reporting window."
      scopeLabel={data.scopeLabel}
      rangeLabel={data.rangeLabel}
      compareLabel={data.compareLabel}
      activeView="branches"
    >
      <AnalyticsFiltersBar
        action="/analytics/branches"
        filters={filters}
        branches={locations}
      />

      {data.rows.length > 0 ? (
        <>
          <section className="grid gap-6 xl:grid-cols-3">
            <AnalyticsBarList
              title="Resolved volume by branch"
              description="Which branches are clearing work fastest in the selected window."
              rows={data.rankings.resolvedVolume}
            />
            <AnalyticsBarList
              title="First response SLA by branch"
              description="Response discipline across locations in the same reporting period."
              rows={data.rankings.firstResponseSla}
            />
            <AnalyticsBarList
              title="Breach count by branch"
              description="Where SLA misses are concentrating right now."
              rows={data.rankings.breachCount}
            />
          </section>

          <BranchComparisonTable rows={data.rows} exportHref={exportHref} />
        </>
      ) : (
        <EmptyAnalyticsState
          title="No branch comparison data in this period"
          description="Try widening the reporting window or resetting the branch filter to compare more locations."
        />
      )}
    </AnalyticsPageShell>
  );
}
