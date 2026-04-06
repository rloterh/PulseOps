import { cn } from '@pulseops/utils';
import type { DashboardKpi } from '@/features/dashboard/types/dashboard.types';

export function KpiCard({ item }: { item: DashboardKpi }) {
  return (
    <article className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_65px_rgba(2,6,23,0.25)]">
      <p className="text-sm text-white/52">{item.label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-tight text-white">
          {item.value}
        </p>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
            item.direction === 'up' && 'bg-emerald-300 text-neutral-950',
            item.direction === 'down' && 'bg-amber-200 text-neutral-950',
            item.direction === 'neutral' && 'bg-white/10 text-white/72',
          )}
        >
          {item.delta}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/44">{item.helperText}</p>
    </article>
  );
}
