import { AnalyticsAiExplanationSheet } from '@/components/analytics/ai-explanation-sheet';
import type { AnalyticsLateJobRiskSignal } from '@/features/analytics/types/analytics.types';

const TONE_STYLES: Record<AnalyticsLateJobRiskSignal['statusTone'], string> = {
  watch: 'border-amber-300/18 bg-amber-300/8 text-amber-100',
  critical: 'border-rose-300/18 bg-rose-300/8 text-rose-100',
};

export function AnalyticsLateJobRiskPanel({
  signals,
}: {
  signals: AnalyticsLateJobRiskSignal[];
}) {
  if (signals.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(17,24,39,0.84))] px-6 py-6 shadow-[0_24px_60px_rgba(2,6,23,0.18)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/42">
            Late-job risk signals
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Jobs the AI layer would put in today&apos;s dispatch review
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-white/55">
          These signals combine due-date pressure, job priority, blocker state, and live SLA
          risk to explain where response effort should go first.
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {signals.map((signal) => (
          <article
            key={signal.jobId}
            className="rounded-[1.5rem] border border-white/8 bg-black/18 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/42">
                  {signal.reference} · {signal.branchName}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">{signal.title}</h3>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${TONE_STYLES[signal.statusTone]}`}
              >
                Risk {signal.score}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                  Status
                </dt>
                <dd className="mt-2 font-medium capitalize text-white">{signal.statusLabel}</dd>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                  Priority
                </dt>
                <dd className="mt-2 font-medium capitalize text-white">{signal.priorityLabel}</dd>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                  Due
                </dt>
                <dd className="mt-2 font-medium text-white">{signal.dueAtLabel}</dd>
              </div>
            </dl>

            <p className="mt-4 text-sm leading-6 text-white/68">{signal.summary}</p>

            <div className="mt-5">
              <AnalyticsAiExplanationSheet
                title={`${signal.reference} lateness-risk explanation`}
                subtitle="Deterministic job, due-date, and SLA signals behind this flagged risk."
                tone={signal.statusTone}
                summary={signal.summary}
                drivers={signal.reasons}
                facts={signal.supportingFacts}
                recommendation={signal.recommendation}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
