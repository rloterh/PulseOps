import { RecordCollaborationPanel } from '@/components/collaboration/record-collaboration-panel';
import { WatchRecordControls } from '@/components/collaboration/watch-record-controls';
import { IncidentAssigneeForm } from '@/components/incidents/incident-assignee-form';
import { IncidentDetailHeader } from '@/components/incidents/incident-detail-header';
import { IncidentEscalationPanel } from '@/components/incidents/incident-escalation-panel';
import { IncidentStatusForm } from '@/components/incidents/incident-status-form';
import { IncidentTimeline } from '@/components/incidents/incident-timeline';
import { getRecordCollaboration } from '@/features/collaboration/queries/get-record-collaboration';
import { getIncidentById } from '@/features/incidents/queries/get-incident-by-id';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const context = await requireTenantMember();
  const incident = await getIncidentById({
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId,
  });
  const [assignees, collaboration] = await Promise.all([
    getMemberOptions(context.tenantId, incident.branchId),
    getRecordCollaboration({
      tenantId: context.tenantId,
      entityType: 'incident',
      entityId: incidentId,
      viewerId: context.viewerId,
      viewerRole: context.membershipRole,
    }),
  ]);

  return (
    <main className="space-y-6">
      <IncidentDetailHeader incident={incident} />

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <IncidentTimeline items={incident.timeline} />
          {collaboration ? (
            <div className="mt-6">
              <RecordCollaborationPanel
                entityType="incident"
                entityId={incident.id}
                returnPath={`/incidents/${incident.id}`}
                comments={collaboration.comments}
                mentionSuggestions={assignees}
                viewerRole={context.membershipRole}
              />
            </div>
          ) : null}
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <IncidentStatusForm incidentId={incident.id} currentStatus={incident.status} />
          <IncidentAssigneeForm
            incidentId={incident.id}
            currentAssigneeUserId={incident.currentAssigneeUserId}
            assignees={assignees}
          />
          <IncidentEscalationPanel
            incidentId={incident.id}
            escalationLevel={incident.escalationLevel}
            escalations={incident.escalations}
            assignees={assignees}
            currentAssigneeUserId={incident.currentAssigneeUserId}
            viewerId={context.viewerId}
            viewerRole={context.membershipRole}
          />
          {collaboration ? (
            <WatchRecordControls
              entityType="incident"
              entityId={incident.id}
              returnPath={`/incidents/${incident.id}`}
              watchState={collaboration.watchState}
            />
          ) : null}
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold tracking-tight text-white">Impact</h2>
            <p className="mt-3 text-sm leading-6 text-white/56">{incident.impactSummary}</p>
          </section>
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold tracking-tight text-white">Next action</h2>
            <p className="mt-3 text-sm leading-6 text-white/56">{incident.nextAction}</p>
          </section>
        </aside>
      </section>
    </main>
  );
}
