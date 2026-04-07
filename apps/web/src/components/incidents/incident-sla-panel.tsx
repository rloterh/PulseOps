import type { IncidentSlaSummary } from '@/features/incidents/types/incident.types';

export function IncidentSlaPanel({ sla }: { sla: IncidentSlaSummary | null }) {
  if (!sla) {
    return (
      <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
        <h2 className="text-lg font-semibold tracking-tight text-white">SLA state</h2>
        <p className="mt-3 text-sm leading-6 text-white/56">
          No SLA policy snapshot is attached to this incident yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">SLA state</h2>
          <p className="mt-2 text-sm leading-6 text-white/52">
            Live snapshot health based on the current incident state, due windows, and
            escalation history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={sla.riskLevel}>{sla.riskLevel}</Badge>
          <Badge tone={sla.escalationState}>{sla.escalationState}</Badge>
          <Badge tone={sla.statusCategory}>{sla.statusCategory}</Badge>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <DetailRow label="Policy" value={sla.policyName ?? 'No policy matched'} />
        <DetailRow label="First response due" value={sla.firstResponseDueAtLabel ?? 'Not set'} />
        <DetailRow label="Resolution due" value={sla.resolutionDueAtLabel ?? 'Not set'} />
        <DetailRow label="First responded" value={sla.firstRespondedAtLabel ?? 'Waiting'} />
        <DetailRow label="Resolved" value={sla.resolvedAtLabel ?? 'Open'} />
        <DetailRow
          label="Escalation triggered"
          value={sla.escalationTriggeredAtLabel ?? 'Not triggered'}
        />
      </div>

      {(sla.firstResponseBreachedAtLabel ||
        sla.resolutionBreachedAtLabel ||
        sla.warningSentAtLabel) ? (
        <div className="mt-5 rounded-[1.25rem] border border-white/8 bg-black/16 p-4 text-sm leading-6 text-white/58">
          {sla.warningSentAtLabel ? (
            <p>Warning window entered: {sla.warningSentAtLabel}</p>
          ) : null}
          {sla.firstResponseBreachedAtLabel ? (
            <p>First response breached: {sla.firstResponseBreachedAtLabel}</p>
          ) : null}
          {sla.resolutionBreachedAtLabel ? (
            <p>Resolution breached: {sla.resolutionBreachedAtLabel}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Badge({
  tone,
  children,
}: {
  tone:
    | 'normal'
    | 'at_risk'
    | 'breached'
    | 'none'
    | 'warning'
    | 'escalated'
    | 'active'
    | 'paused'
    | 'terminal';
  children: string;
}) {
  const toneClass =
    tone === 'breached'
      ? 'border border-red-400/25 bg-red-500/12 text-red-200'
      : tone === 'warning' || tone === 'at_risk'
        ? 'border border-amber-400/25 bg-amber-500/12 text-amber-200'
        : tone === 'escalated'
          ? 'border border-fuchsia-400/25 bg-fuchsia-500/12 text-fuchsia-200'
          : tone === 'terminal'
            ? 'border border-sky-400/25 bg-sky-500/12 text-sky-200'
            : 'border border-emerald-400/25 bg-emerald-500/12 text-emerald-200';

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${toneClass}`}>
      {children}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/42">{label}</dt>
      <dd className="mt-1 font-medium text-white">{value}</dd>
    </div>
  );
}
