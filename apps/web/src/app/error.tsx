'use client';

import { useEffect } from 'react';
import { Button } from '@pulseops/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-warning)]">
              Application Error
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Something went wrong.
            </h1>
            <p className="text-sm leading-6 text-[var(--color-fg-muted)]">
              The global boundary is in place so feature work can add recoverable
              UI states without rebuilding the shell later.
            </p>
            <Button onClick={reset}>Try again</Button>
          </div>
        </main>
      </body>
    </html>
  );
}
