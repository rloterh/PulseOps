import type { AnalyticsKpi } from '@/features/analytics/types/analytics.types';

export function AnalyticsKpiCard({ kpi }: { kpi: AnalyticsKpi }) {
  const toneClass =
    kpi.deltaDirection === 'up'
      ? 'text-emerald-200 border-emerald-400/18 bg-emerald-500/10'
      : kpi.deltaDirection === 'down'
        ? 'text-rose-200 border-rose-400/18 bg-rose-500/10'
        : 'text-white/60 border-white/10 bg-white/[0.05]';

  return (
    <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-white/42">{kpi.label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{kpi.value}</p>
      <div className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs ${toneClass}`}>
        {kpi.deltaLabel}
      </div>
      <p className="mt-4 text-sm leading-6 text-white/52">{kpi.helperText}</p>
    </article>
  );
}
