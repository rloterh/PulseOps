import { AnalyticsAiExplanationSheet } from '@/components/analytics/ai-explanation-sheet';
import type { AnalyticsBranchSummaryCard } from '@/features/analytics/types/analytics.types';

const TONE_STYLES: Record<AnalyticsBranchSummaryCard['statusTone'], string> = {
  stable: 'border-emerald-300/18 bg-emerald-300/8 text-emerald-100',
  watch: 'border-amber-300/18 bg-amber-300/8 text-amber-100',
  critical: 'border-rose-300/18 bg-rose-300/8 text-rose-100',
};

export function AnalyticsBranchSummaryGrid({
  cards,
}: {
  cards: AnalyticsBranchSummaryCard[];
}) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-white/42">
          Branch summary cards
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Where the AI layer sees pressure right now
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.branchId}
            className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(15,23,42,0.78))] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.18)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{card.branchName}</h3>
                <p className="mt-1 text-sm text-white/52">
                  {card.backlogCount} active jobs, {card.incidentCount} incident
                  {card.incidentCount === 1 ? '' : 's'} in the selected window
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${TONE_STYLES[card.statusTone]}`}
              >
                {card.statusTone}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                  Backlog
                </dt>
                <dd className="mt-2 text-xl font-semibold text-white">{card.backlogCount}</dd>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                  Overdue
                </dt>
                <dd className="mt-2 text-xl font-semibold text-white">{card.overdueCount}</dd>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                  Breaches
                </dt>
                <dd className="mt-2 text-xl font-semibold text-white">{card.breachCount}</dd>
              </div>
            </dl>

            <p className="mt-5 text-sm leading-6 text-white/68">{card.recommendation}</p>

            <div className="mt-5">
              <AnalyticsAiExplanationSheet
                title={`${card.branchName} branch explanation`}
                subtitle="Deterministic analytics and SLA signals behind this branch summary card."
                tone={card.statusTone}
                summary={card.summary}
                drivers={card.topDrivers}
                facts={card.supportingFacts}
                recommendation={card.recommendation}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
