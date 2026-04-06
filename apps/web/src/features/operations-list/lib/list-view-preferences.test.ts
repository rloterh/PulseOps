import { describe, expect, it } from 'vitest';
import {
  createDefaultListViewPreferences,
  normalizeListViewPreferences,
} from './list-view-preferences';

describe('listViewPreferences', () => {
  const options = {
    allowedColumns: ['branch', 'status', 'assignee', 'due'] as const,
    defaultVisibleColumns: ['branch', 'status', 'assignee'] as const,
    defaultPageSize: 25 as const,
  };

  it('creates default preferences from the provided options', () => {
    expect(createDefaultListViewPreferences(options)).toEqual({
      density: 'comfortable',
      pageSize: 25,
      visibleColumns: ['branch', 'status', 'assignee'],
    });
  });

  it('normalizes valid persisted preferences', () => {
    expect(
      normalizeListViewPreferences(
        {
          density: 'compact',
          pageSize: 50,
          visibleColumns: ['status', 'due', 'status'],
        },
        options,
      ),
    ).toEqual({
      density: 'compact',
      pageSize: 50,
      visibleColumns: ['status', 'due'],
    });
  });

  it('falls back when persisted preferences are invalid', () => {
    expect(
      normalizeListViewPreferences(
        {
          density: 'dense',
          pageSize: 999,
          visibleColumns: ['unknown'],
        },
        options,
      ),
    ).toEqual({
      density: 'comfortable',
      pageSize: 25,
      visibleColumns: ['branch', 'status', 'assignee'],
    });
  });
});
