import type { IncidentTimelineEntry } from '@/features/incidents/types/incident.types';

export function IncidentTimeline({ items }: { items: IncidentTimelineEntry[] }) {
  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-white">Timeline</h2>
        <p className="mt-2 text-sm leading-6 text-white/46">
          Newest operational updates surface first so the current state is easy to read.
        </p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.35rem] border border-white/8 bg-black/18 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <span className="text-xs uppercase tracking-[0.16em] text-white/38">
                {item.timestampLabel}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/56">{item.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/40">
              {item.actorName} · {item.type.replaceAll('_', ' ')}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
