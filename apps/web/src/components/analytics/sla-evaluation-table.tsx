import type { AnalyticsSlaTableRow } from '@/features/analytics/types/analytics.types';
import { formatMetricMinutes } from '@/features/analytics/lib/metric-formatters';

export function AnalyticsSlaEvaluationTable({
  rows,
}: {
  rows: AnalyticsSlaTableRow[];
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.04]">
      <div className="border-b border-white/8 px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          SLA evaluation table
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/52">
          Record-level SLA outcomes for the selected window. Export-ready delivery will
          land in the next Sprint 8 slice.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-white/72">
          <thead className="bg-black/18 text-xs uppercase tracking-[0.16em] text-white/42">
            <tr>
              <th className="px-5 py-3 font-medium">Reference</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Branch</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Severity</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium">First response</th>
              <th className="px-5 py-3 font-medium">Resolution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.itemId} className="border-t border-white/6 align-top">
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{row.itemReference}</div>
                  <div className="mt-1 text-xs leading-5 text-white/48">{row.itemTitle}</div>
                </td>
                <td className="px-5 py-4 capitalize">{row.itemType}</td>
                <td className="px-5 py-4">{row.branchName}</td>
                <td className="px-5 py-4">{row.priorityLabel ?? 'N/A'}</td>
                <td className="px-5 py-4">{row.severityLabel ?? 'N/A'}</td>
                <td className="px-5 py-4">{row.createdAtLabel}</td>
                <td className="px-5 py-4">
                  <MetricStatus
                    value={formatMetricMinutes(row.firstResponseMinutes)}
                    onTime={row.firstResponseOnTime}
                  />
                </td>
                <td className="px-5 py-4">
                  <MetricStatus
                    value={formatMetricMinutes(row.resolutionMinutes)}
                    onTime={row.resolutionOnTime}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetricStatus({
  value,
  onTime,
}: {
  value: string;
  onTime: boolean | null;
}) {
  const tone =
    onTime === null
      ? 'border-white/10 bg-white/[0.04] text-white/56'
      : onTime
        ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
        : 'border-rose-300/20 bg-rose-300/10 text-rose-100';

  const label = onTime === null ? 'Not evaluated' : onTime ? 'On time' : 'Breached';

  return (
    <div className="space-y-2">
      <div className="font-medium text-white">{value}</div>
      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${tone}`}>
        {label}
      </span>
    </div>
  );
}
