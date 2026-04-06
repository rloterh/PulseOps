import { describe, expect, it } from 'vitest';
import { parseJobListFilters } from './parse-job-list-filters';

describe('parseJobListFilters', () => {
  it('normalizes job filter values', () => {
    expect(
      parseJobListFilters({
        q: ' north ',
        priority: 'high',
        status: 'scheduled',
        type: 'reactive',
      }),
    ).toEqual({
      q: 'north',
      priority: 'high',
      status: 'scheduled',
      type: 'reactive',
      sort: 'due_at',
      direction: 'asc',
    });
  });

  it('falls back to safe defaults for invalid job filters', () => {
    expect(
      parseJobListFilters({
        priority: 'critical',
        status: 'review',
        type: 'service',
      }),
    ).toEqual({
      q: undefined,
      priority: 'all',
      status: 'all',
      type: 'all',
      sort: 'due_at',
      direction: 'asc',
    });
  });

  it('normalizes valid sort params and drops invalid ones to defaults', () => {
    expect(
      parseJobListFilters({
        sort: 'title',
        direction: 'desc',
      }),
    ).toMatchObject({
      sort: 'title',
      direction: 'desc',
    });

    expect(
      parseJobListFilters({
        sort: 'owner',
        direction: 'sideways',
      }),
    ).toMatchObject({
      sort: 'due_at',
      direction: 'asc',
    });
  });
});
