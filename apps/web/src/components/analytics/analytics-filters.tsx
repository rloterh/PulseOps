import type { AnalyticsBranchOption, AnalyticsFilters } from '@/features/analytics/types/analytics.types';

export function AnalyticsFiltersBar({
  action,
  filters,
  branches,
}: {
  action: string;
  filters: AnalyticsFilters;
  branches: AnalyticsBranchOption[];
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
      <form action={action} className="grid gap-3 xl:grid-cols-5">
        <label className="space-y-2 text-sm text-white/68">
          <span>Window</span>
          <select
            name="preset"
            defaultValue={filters.preset}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-white/68">
          <span>Branch</span>
          <select
            name="branchId"
            defaultValue={filters.branchId ?? 'all'}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="all">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-white/68">
          <span>From</span>
          <input
            type="date"
            name="from"
            defaultValue={filters.from ?? ''}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          />
        </label>

        <label className="space-y-2 text-sm text-white/68">
          <span>To</span>
          <input
            type="date"
            name="to"
            defaultValue={filters.to ?? ''}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          />
        </label>

        <div className="flex flex-col justify-end gap-3">
          <label className="flex min-h-11 items-center gap-3 rounded-[1rem] border border-white/10 bg-black/18 px-4 text-sm text-white/72">
            <input
              type="checkbox"
              name="compare"
              value="true"
              defaultChecked={filters.compare}
              className="size-4 rounded"
            />
            Compare previous period
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
            >
              Apply
            </button>
            <a
              href={action}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Reset
            </a>
          </div>
        </div>
      </form>
    </section>
  );
}
