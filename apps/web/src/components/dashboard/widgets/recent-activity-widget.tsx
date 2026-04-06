import type { DashboardActivityItem } from '@/features/dashboard/types/dashboard.types';
import { WidgetCard } from '@/components/dashboard/widget-card';

export function RecentActivityWidget({
  items,
}: {
  items: DashboardActivityItem[];
}) {
  return (
    <WidgetCard
      title="Recent activity"
      description="Operational events, escalations, and workflow updates across the shell."
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
                <p className="mt-2 text-sm leading-6 text-white/50">
                  {item.description}
                </p>
              </div>
              <span className="text-xs text-white/42">{item.timestamp}</span>
            </div>
          </article>
        ))}
      </div>
    </WidgetCard>
  );
}
