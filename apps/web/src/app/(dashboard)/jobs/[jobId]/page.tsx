import { RecordCollaborationPanel } from '@/components/collaboration/record-collaboration-panel';
import { WatchRecordControls } from '@/components/collaboration/watch-record-controls';
import { JobAssigneeForm } from '@/components/jobs/job-assignee-form';
import { JobDetailHeader } from '@/components/jobs/job-detail-header';
import { JobStatusForm } from '@/components/jobs/job-status-form';
import { JobTimeline } from '@/components/jobs/job-timeline';
import { getRecordCollaboration } from '@/features/collaboration/queries/get-record-collaboration';
import { getJobById } from '@/features/jobs/queries/get-job-by-id';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const context = await requireTenantMember();
  const job = await getJobById({
    tenantId: context.tenantId,
    branchId: context.branchId,
    jobId,
  });
  const [assignees, collaboration] = await Promise.all([
    getMemberOptions(context.tenantId, job.branchId),
    getRecordCollaboration({
      tenantId: context.tenantId,
      entityType: 'job',
      entityId: jobId,
      viewerId: context.viewerId,
      viewerRole: context.membershipRole,
    }),
  ]);

  return (
    <main className="space-y-6">
      <JobDetailHeader job={job} />

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <JobTimeline items={job.timeline} />
          {collaboration ? (
            <div className="mt-6">
              <RecordCollaborationPanel
                entityType="job"
                entityId={job.id}
                returnPath={`/jobs/${job.id}`}
                comments={collaboration.comments}
                mentionSuggestions={assignees}
                viewerRole={context.membershipRole}
              />
            </div>
          ) : null}
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <JobStatusForm jobId={job.id} currentStatus={job.status} />
          <JobAssigneeForm
            jobId={job.id}
            currentAssigneeUserId={job.currentAssigneeUserId}
            assignees={assignees}
          />
          {collaboration ? (
            <WatchRecordControls
              entityType="job"
              entityId={job.id}
              returnPath={`/jobs/${job.id}`}
              watchState={collaboration.watchState}
            />
          ) : null}
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Checklist summary
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/56">{job.checklistSummary}</p>
          </section>
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold tracking-tight text-white">Resolution</h2>
            <p className="mt-3 text-sm leading-6 text-white/56">
              {job.resolutionSummary ?? 'Resolution not yet recorded.'}
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
