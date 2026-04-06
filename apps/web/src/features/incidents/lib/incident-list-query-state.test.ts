import { describe, expect, it } from 'vitest';
import {
  getIncidentListSortDirection,
  serializeIncidentListFilters,
  toggleIncidentListSort,
} from './incident-list-query-state';

describe('incidentListQueryState', () => {
  it('serializes only non-default incident filters', () => {
    expect(
      serializeIncidentListFilters({
        q: 'roof',
        severity: 'critical',
        status: 'investigating',
        slaRisk: 'at-risk',
        sort: 'title',
        direction: 'asc',
      }).toString(),
    ).toBe(
      'q=roof&severity=critical&status=investigating&slaRisk=at-risk&sort=title&direction=asc',
    );
  });

  it('toggles sort direction and falls back to defaults', () => {
    const first = toggleIncidentListSort(
      { sort: 'opened_at', direction: 'desc' },
      'severity',
    );
    const second = toggleIncidentListSort(first, 'severity');
    const third = toggleIncidentListSort(second, 'severity');

    expect(first).toMatchObject({ sort: 'severity', direction: 'asc' });
    expect(second).toMatchObject({ sort: 'severity', direction: 'desc' });
    expect(third).toMatchObject({ sort: 'opened_at', direction: 'desc' });
  });

  it('reports the active sort direction for a field', () => {
    expect(
      getIncidentListSortDirection(
        { sort: 'title', direction: 'asc' },
        'title',
      ),
    ).toBe('asc');
    expect(
      getIncidentListSortDirection(
        { sort: 'title', direction: 'asc' },
        'severity',
      ),
    ).toBeNull();
  });
});
