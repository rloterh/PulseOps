import type { DashboardIncidentItem } from '@/features/dashboard/types/dashboard.types';
import { WidgetCard } from '@/components/dashboard/widget-card';

export function IncidentsOverviewWidget({
  items,
}: {
  items: DashboardIncidentItem[];
}) {
  return (
    <WidgetCard
      title="Incidents overview"
      description="Critical and active operational issues for the current branch context."
    >
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.35rem] border border-white/8 bg-black/18 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/40">
                  {item.severity} · {item.status}
                </p>
              </div>
              <span className="text-xs text-white/42">{item.openedLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </WidgetCard>
  );
}
