import { cn } from '@pulseops/utils';
import type { BranchHealthStat } from '@/features/dashboard/types/dashboard.types';
import { WidgetCard } from '@/components/dashboard/widget-card';

export function BranchHealthWidget({ items }: { items: BranchHealthStat[] }) {
  return (
    <WidgetCard
      title="Branch health"
      description="Fast indicators that keep the command center readable before deeper analytics arrive."
    >
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.25rem] border border-white/8 bg-black/18 p-4"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/38">
              {item.label}
            </p>
            <p
              className={cn(
                'mt-3 text-2xl font-semibold tracking-tight',
                item.tone === 'success' && 'text-emerald-300',
                item.tone === 'warning' && 'text-amber-200',
                item.tone === 'danger' && 'text-rose-200',
                item.tone === 'default' && 'text-white',
              )}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
