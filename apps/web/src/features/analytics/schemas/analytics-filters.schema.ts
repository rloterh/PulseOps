import { z } from 'zod';
import type { AnalyticsFilters } from '@/features/analytics/types/analytics.types';

const presetSchema = z.enum(['7d', '30d', '90d', 'custom']);

export const analyticsFiltersSchema = z.object({
  preset: presetSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  branchId: z.string().optional(),
  compare: z.enum(['true', 'false']).optional(),
});

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeDateValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseAnalyticsFilters(
  searchParams: Record<string, string | string[] | undefined>,
): AnalyticsFilters {
  const parsed = analyticsFiltersSchema.safeParse({
    preset: getSingleValue(searchParams.preset),
    from: getSingleValue(searchParams.from),
    to: getSingleValue(searchParams.to),
    branchId: getSingleValue(searchParams.branchId),
    compare: getSingleValue(searchParams.compare),
  });

  if (!parsed.success) {
    return {
      preset: '30d',
      from: null,
      to: null,
      branchId: null,
      compare: true,
    };
  }

  return {
    preset: parsed.data.preset ?? '30d',
    from: normalizeDateValue(parsed.data.from),
    to: normalizeDateValue(parsed.data.to),
    branchId:
      parsed.data.branchId && parsed.data.branchId !== 'all'
        ? parsed.data.branchId
        : null,
    compare: parsed.data.compare !== 'false',
  };
}
