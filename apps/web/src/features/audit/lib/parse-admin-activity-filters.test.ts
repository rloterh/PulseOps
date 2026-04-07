import { describe, expect, it } from 'vitest';
import { parseAdminActivityFilters } from './parse-admin-activity-filters';

const options = {
  actors: [{ value: 'user-1', label: 'Jordan Kim' }],
  scopes: [
    { value: 'incident', label: 'Incident' },
    { value: 'billing', label: 'Billing' },
  ],
  entityTypes: [{ value: 'incident', label: 'Incident' }],
  locations: [{ value: 'loc-1', label: 'London HQ' }],
};

describe('parseAdminActivityFilters', () => {
  it('keeps valid filter values', () => {
    expect(
      parseAdminActivityFilters(
        {
          q: '  escalation  ',
          scope: 'incident',
          actorUserId: 'user-1',
          entityType: 'incident',
          locationId: 'loc-1',
        },
        options,
      ),
    ).toEqual({
      q: 'escalation',
      scope: 'incident',
      actorUserId: 'user-1',
      entityType: 'incident',
      locationId: 'loc-1',
    });
  });

  it('falls back for invalid options', () => {
    expect(
      parseAdminActivityFilters(
        {
          scope: 'weird',
          actorUserId: 'missing',
          entityType: 'job',
          locationId: 'unknown',
        },
        options,
      ),
    ).toEqual({
      q: '',
      scope: 'all',
      actorUserId: 'all',
      entityType: 'all',
      locationId: 'all',
    });
  });
});
