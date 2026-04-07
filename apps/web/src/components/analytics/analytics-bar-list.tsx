import type { AnalyticsBreakdownRow } from '@/features/analytics/types/analytics.types';

export function AnalyticsBarList({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: AnalyticsBreakdownRow[];
}) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
      <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/52">{description}</p>

      <div className="mt-5 space-y-3">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div key={row.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-white">{row.label}</span>
                <span className="text-white/52">{row.helperText}</span>
              </div>
              <div className="h-3 rounded-full bg-white/[0.06]">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.9),rgba(34,211,238,0.55))]"
                  style={{
                    width: `${String(Math.max(10, (row.value / maxValue) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-white/48">
            No data matched this breakdown for the selected window.
          </p>
        )}
      </div>
    </section>
  );
}
