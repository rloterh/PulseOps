export function DashboardHeader({
  tenantName,
  branchName,
}: {
  tenantName: string;
  branchName: string | null;
}) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(17,24,39,0.9),rgba(6,78,59,0.18))] px-6 py-7 shadow-[0_28px_90px_rgba(2,6,23,0.32)]">
      <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/72">
        {tenantName}
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {branchName ? `${branchName} dashboard` : 'Operations dashboard'}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
        Monitor incidents, job flow, SLA exposure, and the current operating
        pulse from one premium command surface.
      </p>
    </section>
  );
}
