import type { AnalyticsFilters } from '@/features/analytics/types/analytics.types';

export type AnalyticsExportDataset = 'branches' | 'sla';

export function buildAnalyticsExportHref(input: {
  dataset: AnalyticsExportDataset;
  filters: AnalyticsFilters;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set('dataset', input.dataset);
  searchParams.set('preset', input.filters.preset);

  if (input.filters.from) {
    searchParams.set('from', input.filters.from);
  }

  if (input.filters.to) {
    searchParams.set('to', input.filters.to);
  }

  if (input.filters.branchId) {
    searchParams.set('branchId', input.filters.branchId);
  }

  if (!input.filters.compare) {
    searchParams.set('compare', 'false');
  }

  return `/api/analytics/export?${searchParams.toString()}`;
}
