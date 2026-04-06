import { describe, expect, it } from 'vitest';
import { parseIncidentListFilters } from './parse-incident-list-filters';

describe('parseIncidentListFilters', () => {
  it('normalizes incident filter values', () => {
    expect(
      parseIncidentListFilters({
        q: ' HVAC ',
        severity: 'critical',
        status: 'investigating',
        slaRisk: 'at-risk',
      }),
    ).toEqual({
      q: 'HVAC',
      severity: 'critical',
      status: 'investigating',
      slaRisk: 'at-risk',
      sort: 'opened_at',
      direction: 'desc',
    });
  });

  it('falls back to safe defaults for invalid incident filters', () => {
    expect(
      parseIncidentListFilters({
        severity: 'urgent',
        status: 'pending',
        slaRisk: 'maybe',
      }),
    ).toEqual({
      q: undefined,
      severity: 'all',
      status: 'all',
      slaRisk: 'all',
      sort: 'opened_at',
      direction: 'desc',
    });
  });

  it('normalizes valid sort params and drops invalid ones to defaults', () => {
    expect(
      parseIncidentListFilters({
        sort: 'title',
        direction: 'asc',
      }),
    ).toMatchObject({
      sort: 'title',
      direction: 'asc',
    });

    expect(
      parseIncidentListFilters({
        sort: 'owner',
        direction: 'sideways',
      }),
    ).toMatchObject({
      sort: 'opened_at',
      direction: 'desc',
    });
  });
});
