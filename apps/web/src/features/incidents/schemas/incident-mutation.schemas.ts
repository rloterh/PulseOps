import { z } from 'zod';

export const updateIncidentStatusSchema = z.object({
  incidentId: z.uuid(),
  status: z.enum(['open', 'investigating', 'monitoring', 'resolved', 'closed']),
});

export const assignIncidentSchema = z.object({
  incidentId: z.uuid(),
  assigneeUserId: z.union([z.uuid(), z.null()]),
});

const escalationTargetRoleSchema = z.union([
  z.enum(['owner', 'admin', 'manager', 'agent']),
  z.literal(''),
  z.null(),
  z.undefined(),
]);

const escalationTargetUserSchema = z.union([z.uuid(), z.literal(''), z.null(), z.undefined()]);

export const createIncidentEscalationSchema = z
  .object({
    incidentId: z.uuid(),
    escalationLevel: z.coerce.number().int().min(1).max(5),
    reason: z
      .string()
      .trim()
      .max(600)
      .transform((value) => (value.length > 0 ? value : '')),
    targetUserId: escalationTargetUserSchema.transform((value) =>
      typeof value === 'string' && value.length > 0 ? value : null,
    ),
    targetRole: escalationTargetRoleSchema.transform((value) =>
      typeof value === 'string' && value.length > 0 ? value : null,
    ),
    targetQueue: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((value) => (typeof value === 'string' ? value.trim() : ''))
      .refine((value) => value.length <= 80, 'Queue must be 80 characters or fewer.'),
  })
  .refine(
    (value) =>
      value.targetUserId !== null ||
      value.targetRole !== null ||
      value.targetQueue.length > 0,
    'Pick a direct owner, role, or queue target before escalating.',
  );

export const acknowledgeIncidentEscalationSchema = z.object({
  incidentId: z.uuid(),
  escalationId: z.uuid(),
});

function transformOptionalString(max: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' ? value.trim() : ''))
    .refine((value) => value.length <= max, 'Must be ' + String(max) + ' characters or fewer.');
}

export const updateIncidentSchema = z.object({
  incidentId: z.uuid(),
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
      (value) => value !== null && !Number.isNaN(new Date(value).getTime()),
      'Provide a valid reported date and time.',
    ),
  slaRisk: z
    .union([z.literal('true'), z.literal('false'), z.boolean(), z.null(), z.undefined()])
    .transform((value) => value === true || value === 'true'),
  impactSummary: transformOptionalString(1200),
  nextAction: transformOptionalString(1200),
});
