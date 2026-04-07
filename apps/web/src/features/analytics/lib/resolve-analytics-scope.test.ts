import { describe, expect, it } from 'vitest';
import { resolveAnalyticsScope } from '@/features/analytics/lib/resolve-analytics-scope';

const locations = [
  { id: 'branch-1', name: 'North' },
  { id: 'branch-2', name: 'South' },
];

describe('resolveAnalyticsScope', () => {
  it('preserves an explicit valid branch filter', () => {
    const scope = resolveAnalyticsScope({
      filters: {
        preset: '30d',
        from: null,
        to: null,
        branchId: 'branch-2',
        compare: true,
      },
      locations,
      shellBranchId: 'branch-1',
    });

    expect(scope.filters.branchId).toBe('branch-2');
    expect(scope.selectedBranch?.name).toBe('South');
  });

  it('falls back to the shell branch when the filter is empty', () => {
    const scope = resolveAnalyticsScope({
      filters: {
        preset: '30d',
        from: null,
        to: null,
        branchId: null,
        compare: true,
      },
      locations,
      shellBranchId: 'branch-1',
    });

    expect(scope.filters.branchId).toBe('branch-1');
    expect(scope.selectedBranch?.name).toBe('North');
  });

  it('drops invalid filter values instead of widening unexpectedly', () => {
    const scope = resolveAnalyticsScope({
      filters: {
        preset: '30d',
        from: null,
        to: null,
        branchId: 'missing-branch',
        compare: true,
      },
      locations,
      shellBranchId: 'branch-1',
    });

    expect(scope.filters.branchId).toBe('branch-1');
    expect(scope.selectedBranch?.name).toBe('North');
  });

  it('returns null when neither the filter nor shell branch is valid', () => {
    const scope = resolveAnalyticsScope({
      filters: {
        preset: '30d',
        from: null,
        to: null,
        branchId: 'missing-branch',
        compare: true,
      },
      locations,
      shellBranchId: 'missing-shell-branch',
    });

    expect(scope.filters.branchId).toBeNull();
    expect(scope.selectedBranch).toBeNull();
  });
});
