import { z } from 'zod';

const savedListViewResourceSchema = z.enum(['jobs', 'incidents']);

const jobFiltersSchema = z.object({
  q: z.string().optional(),
  priority: z.enum(['all', 'urgent', 'high', 'medium', 'low']).optional(),
  status: z
    .enum(['all', 'new', 'scheduled', 'in_progress', 'blocked', 'completed', 'cancelled'])
    .optional(),
  type: z.enum(['all', 'reactive', 'preventive', 'inspection', 'vendor']).optional(),
  sort: z.enum(['due_at', 'title', 'priority', 'status']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
});

const incidentFiltersSchema = z.object({
  q: z.string().optional(),
  severity: z.enum(['all', 'critical', 'high', 'medium', 'low']).optional(),
  status: z
    .enum(['all', 'open', 'investigating', 'monitoring', 'resolved', 'closed'])
    .optional(),
  slaRisk: z.enum(['all', 'at-risk', 'healthy']).optional(),
  sort: z.enum(['opened_at', 'title', 'severity', 'status']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
});

export const createSavedListViewSchema = z
  .object({
    resourceType: savedListViewResourceSchema,
    name: z.string().trim().min(2).max(48),
    filtersPayload: z.string().min(2),
  })
  .superRefine((value, context) => {
    const parsed = parseFiltersPayload(value.resourceType, value.filtersPayload);

    if (!parsed.success) {
      context.addIssue({
        code: 'custom',
        message: 'The current filters could not be saved.',
        path: ['filtersPayload'],
      });
    }
  });

export const deleteSavedListViewSchema = z.object({
  resourceType: savedListViewResourceSchema,
  savedViewId: z.uuid(),
});

export function parseSavedListViewFilters(
  resourceType: z.infer<typeof savedListViewResourceSchema>,
  filtersPayload: string,
) {
  const parsed = parseFiltersPayload(resourceType, filtersPayload);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

function parseFiltersPayload(
  resourceType: z.infer<typeof savedListViewResourceSchema>,
  filtersPayload: string,
) {
  const jsonResult = z
    .string()
    .transform((payload, context) => {
      try {
        return JSON.parse(payload) as unknown;
      } catch {
        context.addIssue({
          code: 'custom',
          message: 'Invalid filters payload.',
        });

        return z.NEVER;
      }
    })
    .safeParse(filtersPayload);

  if (!jsonResult.success) {
    return jsonResult;
  }

  return resourceType === 'jobs'
    ? jobFiltersSchema.safeParse(jsonResult.data)
    : incidentFiltersSchema.safeParse(jsonResult.data);
}
