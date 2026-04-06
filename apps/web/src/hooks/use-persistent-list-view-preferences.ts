'use client';

import { useEffect, useState } from 'react';
import {
  createDefaultListViewPreferences,
  normalizeListViewPreferences,
  type ListDensity,
  type ListPageSize,
  type ListViewPreferenceOptions,
} from '@/features/operations-list/lib/list-view-preferences';

export function usePersistentListViewPreferences<TColumn extends string>(
  storageKey: string,
  options: ListViewPreferenceOptions<TColumn>,
) {
  const [preferences, setPreferences] = useState(() =>
    createDefaultListViewPreferences(options),
  );
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);

      if (stored) {
        setPreferences(normalizeListViewPreferences(JSON.parse(stored), options));
      } else {
        setPreferences(createDefaultListViewPreferences(options));
      }
    } catch {
      setPreferences(createDefaultListViewPreferences(options));
    }

    setHasLoaded(true);
  }, [options, storageKey]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [hasLoaded, preferences, storageKey]);

  function setDensity(density: ListDensity) {
    setPreferences((current) => ({
      ...current,
      density,
    }));
  }

  function setPageSize(pageSize: ListPageSize) {
    setPreferences((current) => ({
      ...current,
      pageSize,
    }));
  }

  function toggleColumn(column: TColumn) {
    setPreferences((current) => {
      if (current.visibleColumns.includes(column)) {
        if (current.visibleColumns.length === 1) {
          return current;
        }

        return {
          ...current,
          visibleColumns: current.visibleColumns.filter(
            (visibleColumn) => visibleColumn !== column,
          ),
        };
      }

      return {
        ...current,
        visibleColumns: [...current.visibleColumns, column],
      };
    });
  }

  return {
    preferences,
    setDensity,
    setPageSize,
    toggleColumn,
  };
}
