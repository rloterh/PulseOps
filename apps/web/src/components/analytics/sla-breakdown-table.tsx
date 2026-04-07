import type { AnalyticsSlaBreakdownRow } from '@/features/analytics/types/analytics.types';
import {
  formatMetricNumber,
  formatMetricPercent,
} from '@/features/analytics/lib/metric-formatters';

export function AnalyticsSlaBreakdownTable({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: AnalyticsSlaBreakdownRow[];
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.04]">
      <div className="border-b border-white/8 px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/52">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-white/72">
          <thead className="bg-black/18 text-xs uppercase tracking-[0.16em] text-white/42">
            <tr>
              <th className="px-5 py-3 font-medium">Group</th>
              <th className="px-5 py-3 font-medium">Evaluated</th>
              <th className="px-5 py-3 font-medium">First response SLA</th>
              <th className="px-5 py-3 font-medium">Resolution SLA</th>
              <th className="px-5 py-3 font-medium">Breaches</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-white/6">
                <td className="px-5 py-4 font-medium text-white">{row.label}</td>
                <td className="px-5 py-4">{formatMetricNumber(row.totalEvaluated)}</td>
                <td className="px-5 py-4">{formatMetricPercent(row.firstResponseRate)}</td>
                <td className="px-5 py-4">{formatMetricPercent(row.resolutionRate)}</td>
                <td className="px-5 py-4">{formatMetricNumber(row.breachCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
