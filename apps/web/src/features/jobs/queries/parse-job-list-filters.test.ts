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
    });
  });
});
