import type { AdminActivitySummary } from '@/features/audit/types/audit.types';

export function AdminActivitySummaryCards({
  summary,
}: {
  summary: AdminActivitySummary;
}) {
  const cards = [
    {
      label: 'Total events',
      value: String(summary.total),
      hint: 'Recent admin-visible audit activity',
    },
    {
      label: 'Incident actions',
      value: String(summary.incidentActions),
      hint: 'Status, ownership, and lifecycle changes',
    },
    {
      label: 'Escalations',
      value: String(summary.escalationActions),
      hint: 'Manual or automatic escalation traces',
    },
    {
      label: 'Billing actions',
      value: String(summary.billingActions),
      hint: 'Commercial-state and entitlement activity',
    },
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">{card.label}</p>
          <p className="mt-4 text-2xl font-semibold text-white">{card.value}</p>
          <p className="mt-3 text-sm leading-6 text-white/55">{card.hint}</p>
        </article>
      ))}
    </section>
  );
}
