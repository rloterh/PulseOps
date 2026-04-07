import { AdminActivitySummaryCards } from '@/components/audit/admin-activity-summary-cards';
import { AdminActivityTable } from '@/components/audit/admin-activity-table';
import { getAdminActivity } from '@/features/audit/queries/get-admin-activity';

export default async function AdminActivityPage() {
  const { logs, summary, tenantName } = await getAdminActivity();

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/72">
          Admin activity
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Review sensitive operational history across {tenantName}.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
          Sprint 7 starts by adding append-only audit visibility for privileged operators.
          This view is intentionally lean today, but it already creates a trustworthy
          foundation for incident, escalation, and admin accountability.
        </p>
      </section>

      <AdminActivitySummaryCards summary={summary} />
      <AdminActivityTable logs={logs} />
    </main>
  );
}
