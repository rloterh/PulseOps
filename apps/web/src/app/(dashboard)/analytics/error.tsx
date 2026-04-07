'use client';

import { useEffect } from 'react';

export default function AnalyticsErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[analytics-page-error]', error);
  }, [error]);

  return (
    <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 p-8">
      <h2 className="text-lg font-semibold tracking-tight text-white">
        Analytics failed to load
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/60">
        There was a problem loading the analytics overview. Try again once the current
        request settles or switch to another reporting window.
      </p>
      <button
        type="button"
        onClick={() => {
          reset();
        }}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:opacity-90"
      >
        Retry
      </button>
    </div>
  );
}
