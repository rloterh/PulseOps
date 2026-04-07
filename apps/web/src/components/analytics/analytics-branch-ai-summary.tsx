import { AnalyticsAiFeedback } from '@/components/analytics/analytics-ai-feedback';
import { AnalyticsAiExplanationSheet } from '@/components/analytics/ai-explanation-sheet';
import type { AnalyticsBranchComparisonAiResult } from '@/features/analytics/types/analytics.types';

export function AnalyticsBranchAiSummary({
  ai,
}: {
  ai: AnalyticsBranchComparisonAiResult;
}) {
  return (
    <section className="rounded-[1.8rem] border border-indigo-300/15 bg-[linear-gradient(135deg,rgba(17,24,39,0.95),rgba(49,46,129,0.28))] px-6 py-6 shadow-[0_24px_70px_rgba(2,6,23,0.22)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.24em] text-indigo-200/72">
            AI branch synthesis
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {ai.summary.headline}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/68 sm:text-base">
            {ai.summary.narrative}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-white/48">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              {ai.generation.source === 'cached' ? 'Cached AI run' : 'Fresh AI run'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              {ai.generation.providerLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              {ai.generation.modelLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              {ai.generation.generatedAtLabel}
            </span>
          </div>
        </div>

        <AnalyticsAiExplanationSheet
          triggerLabel="Inspect branch logic"
          title="Branch comparison AI explanation"
          subtitle="Deterministic comparison facts behind the current branch-to-branch synthesis."
          recommendationLabel="Recommended branch actions"
          tone={
            ai.summary.mostAtRiskBranchName && ai.summary.strongestBranchName !== ai.summary.mostAtRiskBranchName
              ? 'watch'
              : 'stable'
          }
          summary={ai.summary.narrative}
          drivers={ai.summary.keyDrivers}
          facts={ai.summary.supportingFacts}
          recommendation={ai.summary.nextSteps}
          generation={ai.generation}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
            Key drivers
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-white/70">
            {ai.summary.keyDrivers.map((driver) => (
              <li key={driver} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
            Recommended next moves
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-white/70">
            {ai.summary.nextSteps.map((step) => (
              <li key={step} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5">
        <AnalyticsAiFeedback
          runId={ai.generation.runId}
          initialRating={ai.generation.feedbackRating}
        />
      </div>

      {ai.generation.fallbackReason ? (
        <p className="mt-5 text-sm leading-6 text-white/55">
          {ai.generation.fallbackReason}
        </p>
      ) : null}
    </section>
  );
}

