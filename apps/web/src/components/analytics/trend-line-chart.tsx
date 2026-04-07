import type { AnalyticsTrendPoint } from '@/features/analytics/types/analytics.types';

export function TrendLineChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: AnalyticsTrendPoint[];
}) {
  if (data.length === 0) {
    return null;
  }

  const width = 720;
  const height = 220;
  const padding = 24;
  const maxValue = Math.max(
    ...data.flatMap((point) => [
      point.jobsCreated,
      point.jobsResolved,
      point.incidentsOpened,
      1,
    ]),
  );
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const toPath = (selector: (point: AnalyticsTrendPoint) => number) =>
    data
      .map((point, index) => {
        const x = padding + index * stepX;
        const y =
          height -
          padding -
          (selector(point) / maxValue) * (height - padding * 2);

        return `${index === 0 ? 'M' : 'L'} ${String(x)} ${String(y)}`;
      })
      .join(' ');

  return (
    <section className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/52">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-white/56">
          <LegendSwatch label="Jobs created" className="bg-cyan-300" />
          <LegendSwatch label="Jobs resolved" className="bg-emerald-300" />
          <LegendSwatch label="Incidents" className="bg-amber-300" />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${String(width)} ${String(height)}`}
          className="min-w-[42rem]"
          role="img"
          aria-label={title}
        >
          <path
            d={`M ${String(padding)} ${String(height - padding)} H ${String(width - padding)}`}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
          <path
            d={toPath((point) => point.jobsCreated)}
            fill="none"
            stroke="rgb(103 232 249)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={toPath((point) => point.jobsResolved)}
            fill="none"
            stroke="rgb(110 231 183)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={toPath((point) => point.incidentsOpened)}
            fill="none"
            stroke="rgb(253 230 138)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((point, index) => (
            <text
              key={point.label}
              x={padding + index * stepX}
              y={height - 4}
              textAnchor="middle"
              className="fill-white/40 text-[10px] uppercase tracking-[0.14em]"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}

function LegendSwatch({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/18 px-3 py-1">
      <span className={`size-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}
