'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

export function useRecordRowOpen() {
  const router = useRouter();

  function openRecord(href: Route, options?: { newTab?: boolean }) {
    if (options?.newTab) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    router.push(href);
  }

  return {
    openRecord,
  };
}
