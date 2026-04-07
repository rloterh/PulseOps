import type { AnalyticsBranchComparisonRow } from '@/features/analytics/types/analytics.types';
import {
  formatMetricMinutes,
  formatMetricNumber,
  formatMetricPercent,
} from '@/features/analytics/lib/metric-formatters';

export function BranchComparisonTable({
  rows,
}: {
  rows: AnalyticsBranchComparisonRow[];
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.04]">
      <div className="border-b border-white/8 px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Branch performance
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/52">
          Compare throughput, backlog, incidents, and SLA health side by side.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-white/72">
          <thead className="bg-black/18 text-xs uppercase tracking-[0.16em] text-white/42">
            <tr>
              <th className="px-5 py-3 font-medium">Branch</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium">Resolved</th>
              <th className="px-5 py-3 font-medium">Backlog</th>
              <th className="px-5 py-3 font-medium">Backlog delta</th>
              <th className="px-5 py-3 font-medium">Incidents</th>
              <th className="px-5 py-3 font-medium">Median resolution</th>
              <th className="px-5 py-3 font-medium">First response SLA</th>
              <th className="px-5 py-3 font-medium">Resolution SLA</th>
              <th className="px-5 py-3 font-medium">Breaches</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.branchId} className="border-t border-white/6">
                <td className="px-5 py-4 font-medium text-white">{row.branchName}</td>
                <td className="px-5 py-4">{formatMetricNumber(row.jobsCreated)}</td>
                <td className="px-5 py-4">{formatMetricNumber(row.jobsResolved)}</td>
                <td className="px-5 py-4">{formatMetricNumber(row.openBacklog)}</td>
                <td className="px-5 py-4">
                  <BacklogDelta delta={row.backlogDelta} />
                </td>
                <td className="px-5 py-4">{formatMetricNumber(row.incidentCount)}</td>
                <td className="px-5 py-4">
                  {formatMetricMinutes(row.medianResolutionMinutes)}
                </td>
                <td className="px-5 py-4">
                  {formatMetricPercent(row.firstResponseSlaRate)}
                </td>
                <td className="px-5 py-4">{formatMetricPercent(row.resolutionSlaRate)}</td>
                <td className="px-5 py-4">{formatMetricNumber(row.breachCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BacklogDelta({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return <span className="text-white/46">Flat</span>;
  }

  const tone =
    delta > 0
      ? 'text-rose-200 bg-rose-300/10 border-rose-300/20'
      : 'text-emerald-200 bg-emerald-300/10 border-emerald-300/20';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}>
      {delta > 0 ? '+' : ''}
      {String(delta)}
    </span>
  );
}
