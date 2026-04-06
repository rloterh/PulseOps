import { updateIncidentStatusAction } from '@/actions/incidents/update-incident-status-action';
import type { IncidentStatus } from '@/features/incidents/types/incident.types';

export function IncidentStatusForm({
  incidentId,
  currentStatus,
}: {
  incidentId: string;
  currentStatus: IncidentStatus;
}) {
  return (
    <form
      action={updateIncidentStatusAction}
      className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5"
    >
      <h2 className="text-lg font-semibold tracking-tight text-white">Update status</h2>
      <input type="hidden" name="incidentId" value={incidentId} />
      <div className="mt-4 space-y-3">
        <select
          name="status"
          defaultValue={currentStatus}
          className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
        >
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
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
