import { z } from 'zod';

function transformOptionalString(max: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' ? value.trim() : ''))
    .refine((value) => value.length <= max, 'Must be ' + String(max) + ' characters or fewer.');
}

export const createIncidentSchema = z.object({
  locationId: z.uuid(),
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(4000),
  customerName: z.string().trim().min(2).max(120),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  reportedAt: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== 'string' || value.trim().length === 0) {
        return null;
      }

      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
    })
    .refine(
      (value) => value === null || !Number.isNaN(new Date(value).getTime()),
      'Provide a valid reported date and time.',
    ),
  assigneeUserId: z
    .union([z.uuid(), z.literal(''), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' && value.length > 0 ? value : null)),
  slaRisk: z
    .union([z.literal('true'), z.literal('false'), z.boolean(), z.null(), z.undefined()])
    .transform((value) => value === true || value === 'true'),
  impactSummary: transformOptionalString(1200),
  nextAction: transformOptionalString(1200),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
