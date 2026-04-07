import { AnalyticsAiFeedback } from '@/components/analytics/analytics-ai-feedback';
import Link from 'next/link';
import { AnalyticsAiExplanationSheet } from '@/components/analytics/ai-explanation-sheet';
import type { AiGenerationMeta } from '@/features/ai/types/ai.types';
import type { AnalyticsExecutiveSummary } from '@/features/analytics/types/analytics.types';

export function AnalyticsAiExecutiveSummary({
  summary,
  generation,
}: {
  summary: AnalyticsExecutiveSummary;
  generation: AiGenerationMeta;
}) {
  return (
    <section className="rounded-[1.8rem] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(12,22,35,0.96),rgba(11,75,109,0.32))] px-6 py-6 shadow-[0_24px_70px_rgba(2,6,23,0.22)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
            AI layer
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {summary.headline}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/68 sm:text-base">
            {summary.narrative}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-white/48">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              {generation.source === 'cached' ? 'Cached AI run' : 'Fresh AI run'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              {generation.providerLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              {generation.modelLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              {generation.generatedAtLabel}
            </span>
          </div>
        </div>
        <div className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
          {summary.confidenceLabel}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <AnalyticsAiExplanationSheet
          triggerLabel="Inspect summary logic"
          title="Executive summary explanation"
          subtitle="Deterministic operational facts behind the current executive summary."
          recommendationLabel="Recommended next moves"
          tone="watch"
          summary={summary.narrative}
          drivers={summary.highlights}
          facts={summary.supportingFacts}
          recommendation={summary.nextSteps}
          generation={generation}
        />
        <Link
          href="/analytics/branches"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
        >
          Open branch comparison
        </Link>
      </div>

      <div className="mt-4">
        <AnalyticsAiFeedback
          runId={generation.runId}
          initialRating={generation.feedbackRating}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
            Why PulseOps is saying this
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-white/70">
            {summary.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
            Recommended next moves
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-white/70">
            {summary.nextSteps.map((step) => (
              <li key={step} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {generation.fallbackReason ? (
        <p className="mt-5 text-sm leading-6 text-white/55">
          {generation.fallbackReason}
        </p>
      ) : null}
    </section>
  );
}
