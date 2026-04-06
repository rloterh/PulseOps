import { cn } from '@pulseops/utils';
import type { JobPriority } from '@/features/jobs/types/job.types';

const PRIORITY_CLASSES: Record<JobPriority, string> = {
  urgent: 'border-rose-300/24 bg-rose-300/14 text-rose-50',
  high: 'border-orange-300/24 bg-orange-300/12 text-orange-50',
  medium: 'border-amber-300/22 bg-amber-300/10 text-amber-100',
  low: 'border-sky-300/22 bg-sky-300/10 text-sky-100',
};

export function JobPriorityBadge({ priority }: { priority: JobPriority }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
        PRIORITY_CLASSES[priority],
      )}
    >
      {priority}
    </span>
  );
}
