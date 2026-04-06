import type { DashboardJobItem } from '@/features/dashboard/types/dashboard.types';
import { WidgetCard } from '@/components/dashboard/widget-card';

export function UpcomingJobsWidget({ items }: { items: DashboardJobItem[] }) {
  return (
    <WidgetCard
      title="Upcoming jobs"
      description="Scheduled work and near-term commitments for the selected operating context."
    >
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.35rem] border border-white/8 bg-black/18 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-2 text-sm text-white/50">{item.assigneeLabel}</p>
              </div>
              <span className="text-xs text-white/42">{item.dueLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </WidgetCard>
  );
}
