import Link from 'next/link';
import { AnalyticsBarList } from '@/components/analytics/analytics-bar-list';
import { AnalyticsFiltersBar } from '@/components/analytics/analytics-filters';
import { AnalyticsPageShell } from '@/components/analytics/analytics-page-shell';
import { EmptyAnalyticsState } from '@/components/analytics/empty-analytics-state';
import { AnalyticsSlaBreakdownTable } from '@/components/analytics/sla-breakdown-table';
import { AnalyticsSlaEvaluationTable } from '@/components/analytics/sla-evaluation-table';
import { AnalyticsSlaSummaryCards } from '@/components/analytics/sla-summary-cards';
import { canViewAnalytics } from '@/features/analytics/lib/analytics.permissions';
import { buildAnalyticsExportHref } from '@/features/analytics/lib/build-analytics-export-href';
import { resolveAnalyticsDateRange } from '@/features/analytics/lib/date-range';
import { resolveAnalyticsScope } from '@/features/analytics/lib/resolve-analytics-scope';
import { getAnalyticsSlaMetrics } from '@/features/analytics/queries/get-analytics-sla-metrics';
import { parseAnalyticsFilters } from '@/features/analytics/schemas/analytics-filters.schema';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { redirect } from 'next/navigation';

export default async function AnalyticsSlaPage({
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
            SLA reporting is locked on the current billing plan.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
            Upgrade the workspace to inspect service-target attainment, breach
            concentration, and record-level SLA outcomes.
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

  const data = await getAnalyticsSlaMetrics({
    tenantId: context.tenantId,
    filters,
    range,
    branches: locations,
  });
  const exportHref = buildAnalyticsExportHref({
    dataset: 'sla',
    filters,
  });

  return (
    <AnalyticsPageShell
      title="SLA metrics"
      subtitle="Track first response and resolution performance against the service targets already driving PulseOps escalations."
      scopeLabel={data.scopeLabel}
      rangeLabel={data.rangeLabel}
      compareLabel={data.compareLabel}
      activeView="sla"
    >
      <AnalyticsFiltersBar action="/analytics/sla" filters={filters} branches={locations} />

      {data.summary.totalEvaluated > 0 ? (
        <>
          <AnalyticsSlaSummaryCards summary={data.summary} />

          <section className="grid gap-6 xl:grid-cols-3">
            <AnalyticsBarList
              title="First response SLA by branch"
              description="Which branches are holding response targets most consistently."
              rows={data.breakdowns.byBranch.map((row) => ({
                label: row.label,
                value: Math.round(row.firstResponseRate ?? 0),
                helperText: `${String(row.totalEvaluated)} evaluated · ${String(row.breachCount)} breaches`,
              }))}
            />
            <AnalyticsBarList
              title="Resolution SLA by priority"
              description="How urgency bands are performing against completion targets."
              rows={data.breakdowns.byPriority.map((row) => ({
                label: row.label,
                value: Math.round(row.resolutionRate ?? 0),
                helperText: `${String(row.totalEvaluated)} evaluated · ${String(row.breachCount)} breaches`,
              }))}
            />
            <AnalyticsBarList
              title="Breach concentration by severity"
              description="Where higher-severity work is still slipping against target."
              rows={data.breakdowns.bySeverity.map((row) => ({
                label: row.label,
                value: row.breachCount,
                helperText: `${String(row.totalEvaluated)} evaluated records`,
              }))}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <AnalyticsSlaBreakdownTable
              title="By branch"
              description="Service-target performance broken down by branch."
              rows={data.breakdowns.byBranch}
            />
            <AnalyticsSlaBreakdownTable
              title="By priority"
              description="Job-target performance by operational urgency."
              rows={data.breakdowns.byPriority}
            />
          </section>

          <AnalyticsSlaBreakdownTable
            title="By severity"
            description="Incident-target performance by severity band."
            rows={data.breakdowns.bySeverity}
          />

          <AnalyticsSlaEvaluationTable rows={data.table} exportHref={exportHref} />
        </>
      ) : (
        <EmptyAnalyticsState
          title="No SLA evaluations in this period"
          description="Try widening the reporting window or switching to another branch scope from the shell."
        />
      )}
    </AnalyticsPageShell>
  );
}
