import { z } from 'zod';

const nullableUuid = z.union([z.uuid(), z.literal(''), z.null(), z.undefined()]).transform((value) =>
  typeof value === 'string' && value.length > 0 ? value : null,
);

export const directorySearchSchema = z.object({
  organizationId: z.uuid(),
  locationId: nullableUuid,
  query: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value ?? ''),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const directorySearchRouteSchema = z.object({
  locationId: nullableUuid,
  q: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value ?? ''),
  limit: z.coerce.number().int().min(1).max(25).default(12),
});
