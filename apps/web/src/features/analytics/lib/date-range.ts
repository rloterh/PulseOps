import type { AnalyticsDateRange, AnalyticsFilters } from '@/features/analytics/types/analytics.types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function resolveAnalyticsDateRange(
  filters: AnalyticsFilters,
  now = new Date(),
): AnalyticsDateRange {
  if (filters.preset === 'custom' && filters.from && filters.to) {
    const from = startOfDay(new Date(filters.from));
    const to = endOfDay(new Date(filters.to));

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      return resolvePresetRange('30d', filters.compare, now);
    }

    return buildRange(from, to, filters.compare, 'Custom range');
  }

  return resolvePresetRange(filters.preset, filters.compare, now);
}

function resolvePresetRange(
  preset: AnalyticsFilters['preset'],
  compare: boolean,
  now: Date,
) {
  const normalizedNow = endOfDay(now);
  const dayCount = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
  const from = startOfDay(new Date(normalizedNow.getTime() - (dayCount - 1) * DAY_IN_MS));

  return buildRange(from, normalizedNow, compare, `${String(dayCount)} day window`);
}

function buildRange(
  from: Date,
  to: Date,
  compare: boolean,
  label: string,
): AnalyticsDateRange {
  const durationDays = Math.max(
    1,
    Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_IN_MS) + 1,
  );
  const compareTo = compare ? endOfDay(new Date(from.getTime() - DAY_IN_MS)) : null;
  const compareFrom = compareTo
    ? startOfDay(new Date(compareTo.getTime() - (durationDays - 1) * DAY_IN_MS))
    : null;

  return {
    from,
    to,
    label,
    compareFrom,
    compareTo,
  };
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}
