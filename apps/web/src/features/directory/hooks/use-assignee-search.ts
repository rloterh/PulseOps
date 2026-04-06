'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import type { DirectoryUser } from '@/features/directory/types/directory.types';

interface Input {
  initialResults: DirectoryUser[];
  locationId: string | null;
  query: string;
  limit?: number;
}

export function useAssigneeSearch({
  initialResults,
  locationId,
  query,
  limit = 12,
}: Input) {
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState(initialResults);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResults(initialResults);
  }, [initialResults]);

  useEffect(() => {
    if (!locationId) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        setError(null);

        try {
          const params = new URLSearchParams({
            locationId,
            q: deferredQuery.trim(),
            limit: String(limit),
          });
          const response = await fetch(`/api/directory/assignees?${params.toString()}`, {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store',
          });
          const payload = (await response.json()) as {
            data?: DirectoryUser[];
            error?: string;
          };

          if (!response.ok) {
            throw new Error(payload.error ?? 'Failed to search the assignee directory.');
          }

          setResults(payload.data ?? []);
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : 'Failed to search the assignee directory.',
          );
        } finally {
          setIsLoading(false);
        }
      })();
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [deferredQuery, limit, locationId]);

  return {
    results,
    isLoading,
    error,
  };
}
