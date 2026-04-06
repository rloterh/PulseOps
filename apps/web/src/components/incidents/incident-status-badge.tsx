import { cn } from '@pulseops/utils';
import type { IncidentStatus } from '@/features/incidents/types/incident.types';

const STATUS_CLASSES: Record<IncidentStatus, string> = {
  open: 'border-rose-300/20 bg-rose-300/10 text-rose-100',
  investigating: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  monitoring: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
  resolved: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  closed: 'border-white/10 bg-white/[0.05] text-white/72',
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
        STATUS_CLASSES[status],
      )}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}
