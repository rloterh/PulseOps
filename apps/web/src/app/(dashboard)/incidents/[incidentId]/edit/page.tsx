import type { Route } from 'next';
import Link from 'next/link';
import { EditIncidentForm } from '@/components/incidents/edit-incident-form';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getIncidentForEdit } from '@/features/incidents/queries/get-incident-for-edit';

export default async function EditIncidentPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const context = await requireTenantMember();
  const incident = await getIncidentForEdit({
    tenantId: context.tenantId,
    branchId: context.branchId,
    incidentId,
  });

  return (
    <main className="space-y-6">
      <ListPageHeader
        eyebrow={`${incident.branchName} branch`}
        title="Edit incident"
        description="Update the operating picture without losing the response history around the incident."
        actions={
          <Link
            href={`/incidents/${incident.id}` as Route}
            className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to incident
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
          <EditIncidentForm incident={incident} />
        </article>

        <aside className="space-y-4">
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/72">
              Incident response
            </p>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
              Response history stays visible
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/56">
              Title, severity, customer impact, and next-action edits all write back into the timeline so handoffs do not lose context.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
