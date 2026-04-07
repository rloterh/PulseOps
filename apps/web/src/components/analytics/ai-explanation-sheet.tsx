'use client';

import { useId, useState } from 'react';
import type { AiGenerationMeta } from '@/features/ai/types/ai.types';
import type { AnalyticsSupportingFact } from '@/features/analytics/types/analytics.types';

const TONE_STYLES = {
  stable: 'border-emerald-300/18 bg-emerald-300/8 text-emerald-100',
  watch: 'border-amber-300/18 bg-amber-300/8 text-amber-100',
  critical: 'border-rose-300/18 bg-rose-300/8 text-rose-100',
} as const;

export function AnalyticsAiExplanationSheet({
  triggerLabel,
  title,
  subtitle,
  recommendationLabel,
  tone,
  summary,
  drivers,
  facts,
  recommendation,
  generation,
}: {
  triggerLabel?: string;
  title: string;
  subtitle: string;
  recommendationLabel?: string;
  tone: keyof typeof TONE_STYLES;
  summary: string;
  drivers: string[];
  facts: AnalyticsSupportingFact[];
  recommendation: string | string[];
  generation?: AiGenerationMeta;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
      >
        {triggerLabel ?? 'Inspect explanation'}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/68 p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="flex h-full max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,27,0.98),rgba(14,23,38,0.98))] shadow-[0_28px_90px_rgba(2,6,23,0.46)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/70">
                  AI explanation
                </p>
                <h2
                  id={titleId}
                  className="mt-2 text-xl font-semibold tracking-tight text-white"
                >
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/54">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${TONE_STYLES[tone]}`}
                >
                  {tone}
                </span>
                {generation ? (
                  <>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white/72">
                      {generation.source === 'cached' ? 'Cached run' : 'Fresh run'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white/72">
                      {generation.providerLabel}
                    </span>
                  </>
                ) : null}
              </div>

              <section className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                  Summary
                </p>
                <p className="mt-3 text-sm leading-7 text-white/70">{summary}</p>
              </section>

              <section className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                  Why PulseOps flagged this
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-white/70">
                  {drivers.map((driver) => (
                    <li key={driver} className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                  Supporting facts
                </p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div
                      key={`${fact.label}:${fact.value}`}
                      className="rounded-2xl border border-white/6 bg-black/18 px-4 py-3"
                    >
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                        {fact.label}
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-white">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {generation ? (
                <section className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                    Generation metadata
                  </p>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/6 bg-black/18 px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                        Generated at
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-white">
                        {generation.generatedAtLabel}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-black/18 px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                        Model
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-white">
                        {generation.modelLabel}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-black/18 px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                        Prompt version
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-white">
                        {generation.promptVersion}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-black/18 px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/42">
                        Feedback state
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-white">
                        {generation.feedbackRating === 'helpful'
                          ? 'Helpful'
                          : generation.feedbackRating === 'not_helpful'
                            ? 'Needs work'
                            : 'Not rated yet'}
                      </dd>
                    </div>
                  </dl>
                  {generation.fallbackReason ? (
                    <p className="mt-4 text-sm leading-6 text-white/60">
                      {generation.fallbackReason}
                    </p>
                  ) : null}
                </section>
              ) : null}

              <section className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                  {recommendationLabel ?? 'Recommended next move'}
                </p>
                {Array.isArray(recommendation) ? (
                  <ul className="mt-3 space-y-3 text-sm leading-7 text-white/70">
                    {recommendation.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-white/70">{recommendation}</p>
                )}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
