import { updateTaskStatusAction } from '@/actions/tasks/update-task-status-action';
import type { TaskStatus } from '@/features/tasks/types/task.types';

export function TaskStatusForm({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: TaskStatus;
}) {
  return (
    <form
      action={updateTaskStatusAction}
      className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5"
    >
      <h2 className="text-lg font-semibold tracking-tight text-white">Update status</h2>
      <input type="hidden" name="taskId" value={taskId} />
      <div className="mt-4 space-y-3">
        <select
          name="status"
          defaultValue={currentStatus}
          className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
        >
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-full bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90"
        >
          Save status
        </button>
      </div>
    </form>
  );
}
