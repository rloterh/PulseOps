'use client';

import { useState, useTransition } from 'react';
import type { AiFeedbackRating } from '@/features/ai/types/ai.types';

export function AnalyticsAiFeedback({
  runId,
  initialRating,
}: {
  runId: string | null;
  initialRating: AiFeedbackRating | null;
}) {
  const [rating, setRating] = useState<AiFeedbackRating | null>(initialRating);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!runId) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-xs uppercase tracking-[0.18em] text-white/42">
        Was this helpful?
      </p>
      <div className="flex flex-wrap gap-2">
        {([
          ['helpful', 'Helpful'],
          ['not_helpful', 'Needs work'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                try {
                  const response = await fetch('/api/ai/feedback', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      runId,
                      rating: value,
                    }),
                  });

                  if (!response.ok) {
                    setMessage('Feedback could not be saved right now.');
                    return;
                  }

                  setRating(value);
                  setMessage(
                    value === 'helpful' ? 'Marked helpful.' : 'Marked for improvement.',
                  );
                } catch {
                  setMessage('Feedback could not be saved right now.');
                }
              });
            }}
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition ${
              rating === value
                ? 'border-cyan-300/40 bg-cyan-300/12 text-cyan-100'
                : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]'
            } ${isPending ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
      {message ? <p className="text-sm text-white/55">{message}</p> : null}
    </div>
  );
}
