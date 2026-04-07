import Link from 'next/link';
import { AnalyticsBarList } from '@/components/analytics/analytics-bar-list';
import { AnalyticsFiltersBar } from '@/components/analytics/analytics-filters';
import { AnalyticsKpiCard } from '@/components/analytics/kpi-card';
import { AnalyticsPageShell } from '@/components/analytics/analytics-page-shell';
import { EmptyAnalyticsState } from '@/components/analytics/empty-analytics-state';
import { TrendLineChart } from '@/components/analytics/trend-line-chart';
import { canViewAnalytics } from '@/features/analytics/lib/analytics.permissions';
import { resolveAnalyticsDateRange } from '@/features/analytics/lib/date-range';
import { resolveAnalyticsScope } from '@/features/analytics/lib/resolve-analytics-scope';
import { getAnalyticsOverview } from '@/features/analytics/queries/get-analytics-overview';
import { parseAnalyticsFilters } from '@/features/analytics/schemas/analytics-filters.schema';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { redirect } from 'next/navigation';

export default async function AnalyticsPage({
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
  const { filters, selectedBranch } = resolveAnalyticsScope({
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
            Analytics is locked on the current billing plan.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
            Sprint 8 starts the real analytics layer, but the data views remain gated
            behind paid entitlements. Upgrade the workspace to unlock overview trends,
            branch comparison, and SLA reporting.
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

  const overview = await getAnalyticsOverview({
    tenantId: context.tenantId,
    branchId: filters.branchId,
    filters,
    range,
    branchName: selectedBranch?.name ?? context.branchName,
  });
  const hasData = overview.kpis.some((kpi) => kpi.value !== '0');

  return (
    <AnalyticsPageShell
      title="Operations overview"
      subtitle="Track volume, response health, and incident pressure without leaving the protected PulseOps shell."
      scopeLabel={overview.scopeLabel}
      rangeLabel={overview.rangeLabel}
      compareLabel={overview.compareLabel}
      activeView="overview"
    >
      <AnalyticsFiltersBar
        action="/analytics"
        filters={filters}
        branches={locations}
      />

      {hasData ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overview.kpis.map((kpi) => (
              <AnalyticsKpiCard key={kpi.label} kpi={kpi} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
            <TrendLineChart
              title="Jobs and incidents over time"
              description="Created jobs, resolved jobs, and incident openings across the selected reporting window."
              data={overview.charts.volumeTrend}
            />
            <AnalyticsBarList
              title="Jobs by status"
              description="Current status mix for jobs created in the selected window."
              rows={overview.charts.jobsByStatus}
            />
          </section>

          <AnalyticsBarList
            title="Jobs by priority"
            description="Operational demand mix across the current reporting window."
            rows={overview.charts.jobsByPriority}
          />
        </>
      ) : (
        <EmptyAnalyticsState />
      )}
    </AnalyticsPageShell>
  );
}
