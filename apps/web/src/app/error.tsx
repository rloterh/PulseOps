'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/system/error-state';

export default function AppError({
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
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
      <ErrorState
        title="PulseOps hit an unexpected app error."
        description="The current route crashed before it could finish rendering. You can retry safely or return home."
        onAction={reset}
        actionHref="/"
      />
    </main>
  );
}
