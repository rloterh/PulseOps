import type { Route } from 'next';
import Link from 'next/link';
import { EditJobForm } from '@/components/jobs/edit-job-form';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getJobForEdit } from '@/features/jobs/queries/get-job-for-edit';

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const context = await requireTenantMember();
  const job = await getJobForEdit({
    tenantId: context.tenantId,
    branchId: context.branchId,
    jobId,
  });

  return (
    <main className="space-y-6">
      <ListPageHeader
        eyebrow={`${job.branchName} branch`}
        title="Edit job"
        description="Keep the operational record current without losing the timeline trail behind it."
        actions={
          <Link
            href={`/jobs/${job.id}` as Route}
            className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to job
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
          <EditJobForm job={job} />
        </article>

        <aside className="space-y-4">
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/72">
              Job lifecycle
            </p>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
              Edits write history
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/56">
              Major field changes are captured as timeline notes so coordinators can see what shifted without diffing the record by hand.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
