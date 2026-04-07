'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/system/error-state';

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
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
          <ErrorState
            title="PulseOps could not recover from a shell-level failure."
            description="A critical part of the application shell failed. Try the request again or reload the app from the homepage."
            onAction={reset}
            actionHref="/"
          />
        </main>
      </body>
    </html>
  );
}
