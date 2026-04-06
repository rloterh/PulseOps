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
    });
  });
});
