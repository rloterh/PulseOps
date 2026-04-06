import { WidgetCard } from '@/components/dashboard/widget-card';

export function SlaRiskWidget({ count }: { count: number }) {
  return (
    <WidgetCard
      title="SLA risk"
      description="Incidents and jobs approaching intervention thresholds."
    >
      <div className="flex items-center justify-between rounded-[1.35rem] border border-white/8 bg-black/18 p-5">
        <div>
          <p className="text-sm text-white/48">Items at risk</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {count}
          </p>
        </div>
        <div className="flex size-14 items-center justify-center rounded-[1.25rem] border border-amber-200/18 bg-amber-200/10 text-amber-100">
          <span className="text-lg font-semibold">!</span>
        </div>
      </div>
    </WidgetCard>
  );
}
