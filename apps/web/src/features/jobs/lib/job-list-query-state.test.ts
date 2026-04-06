import { describe, expect, it } from 'vitest';
import {
  getJobListSortDirection,
  serializeJobListFilters,
  toggleJobListSort,
} from './job-list-query-state';

describe('jobListQueryState', () => {
  it('serializes only non-default job filters', () => {
    expect(
      serializeJobListFilters({
        q: 'pump',
        priority: 'high',
        status: 'all',
        type: 'reactive',
        sort: 'title',
        direction: 'desc',
      }).toString(),
    ).toBe('q=pump&priority=high&type=reactive&sort=title&direction=desc');
  });

  it('toggles sort direction and falls back to defaults', () => {
    const first = toggleJobListSort(
      { sort: 'due_at', direction: 'asc' },
      'title',
    );
    const second = toggleJobListSort(first, 'title');
    const third = toggleJobListSort(second, 'title');

    expect(first).toMatchObject({ sort: 'title', direction: 'asc' });
    expect(second).toMatchObject({ sort: 'title', direction: 'desc' });
    expect(third).toMatchObject({ sort: 'due_at', direction: 'asc' });
  });

  it('reports the active sort direction for a field', () => {
    expect(
      getJobListSortDirection({ sort: 'title', direction: 'desc' }, 'title'),
    ).toBe('desc');
    expect(
      getJobListSortDirection({ sort: 'title', direction: 'desc' }, 'status'),
    ).toBeNull();
  });
});
