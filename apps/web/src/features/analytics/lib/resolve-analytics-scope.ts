import type {
  AnalyticsBranchOption,
  AnalyticsFilters,
} from '@/features/analytics/types/analytics.types';

export function resolveAnalyticsScope(input: {
  filters: AnalyticsFilters;
  locations: AnalyticsBranchOption[];
  shellBranchId: string | null;
}) {
  const validBranchIds = new Set(input.locations.map((location) => location.id));
  const requestedBranchId =
    input.filters.branchId && validBranchIds.has(input.filters.branchId)
      ? input.filters.branchId
      : null;
  const shellBranchId =
    input.shellBranchId && validBranchIds.has(input.shellBranchId)
      ? input.shellBranchId
      : null;
  const branchId = requestedBranchId ?? shellBranchId ?? null;
  const selectedBranch = branchId
    ? input.locations.find((location) => location.id === branchId) ?? null
    : null;

  return {
    filters: {
      ...input.filters,
      branchId,
    } satisfies AnalyticsFilters,
    selectedBranch,
  };
}
