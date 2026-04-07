'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/system/error-state';

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
    <ErrorState
      title="Analytics failed to load"
      description="There was a problem loading the analytics workspace. Retry once the current request settles or switch to another reporting window."
      onAction={reset}
      actionHref="/analytics"
    />
  );
}
