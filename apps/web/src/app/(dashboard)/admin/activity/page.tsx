import { AdminActivityFilters } from '@/components/audit/admin-activity-filters';
import { AdminActivitySummaryCards } from '@/components/audit/admin-activity-summary-cards';
import { AdminActivityTable } from '@/components/audit/admin-activity-table';
import { buildAdminActivityQuery } from '@/features/audit/lib/build-admin-activity-query';
import { getAdminActivity } from '@/features/audit/queries/get-admin-activity';

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const { logs, summary, tenantName, filters, filterOptions, pagination } =
    await getAdminActivity(resolvedSearchParams);
  const previousQuery = buildAdminActivityQuery(filters, pagination.page - 1);
  const nextQuery = buildAdminActivityQuery(filters, pagination.page + 1);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/72">
          Admin activity
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Review sensitive operational history across {tenantName}.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
          Inspect incident, escalation, billing, and operator activity with filterable
          pagination, metadata drill-down, and append-only evidence you can trust during
          operational review.
        </p>
      </section>

      <AdminActivityFilters filters={filters} options={filterOptions} />
      <AdminActivitySummaryCards summary={summary} />
      <AdminActivityTable
        logs={logs}
        pagination={pagination}
        previousHref={previousQuery ? `/admin/activity?${previousQuery}` : '/admin/activity'}
        nextHref={nextQuery ? `/admin/activity?${nextQuery}` : '/admin/activity'}
      />
    </main>
  );
}
