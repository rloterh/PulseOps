import type { AnalyticsSlaSummary } from '@/features/analytics/types/analytics.types';
import {
  formatMetricMinutes,
  formatMetricNumber,
  formatMetricPercent,
} from '@/features/analytics/lib/metric-formatters';

export function AnalyticsSlaSummaryCards({
  summary,
}: {
  summary: AnalyticsSlaSummary;
}) {
  const cards = [
    {
      label: 'First response SLA',
      value: formatMetricPercent(summary.firstResponseRate),
      helper: `${formatMetricNumber(summary.firstResponseOnTime)} on time · ${formatMetricNumber(summary.firstResponseBreached)} breached`,
    },
    {
      label: 'Resolution SLA',
      value: formatMetricPercent(summary.resolutionRate),
      helper: `${formatMetricNumber(summary.resolutionOnTime)} on time · ${formatMetricNumber(summary.resolutionBreached)} breached`,
    },
    {
      label: 'Median first response',
      value: formatMetricMinutes(summary.medianFirstResponseMinutes),
      helper: `P95 ${formatMetricMinutes(summary.p95FirstResponseMinutes)}`,
    },
    {
      label: 'Median resolution',
      value: formatMetricMinutes(summary.medianResolutionMinutes),
      helper: `P95 ${formatMetricMinutes(summary.p95ResolutionMinutes)}`,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">{card.label}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{card.value}</p>
          <p className="mt-4 text-sm leading-6 text-white/52">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}
