import { cn } from '@pulseops/utils';
import type { TaskStatus } from '@/features/tasks/types/task.types';

const STATUS_CLASSES: Record<TaskStatus, string> = {
  todo: 'border-white/10 bg-white/[0.05] text-white/72',
  in_progress: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  blocked: 'border-rose-300/20 bg-rose-300/10 text-rose-100',
  completed: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  cancelled: 'border-white/10 bg-black/20 text-white/52',
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
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
