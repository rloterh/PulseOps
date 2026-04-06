import { z } from 'zod';

export const updateJobStatusSchema = z.object({
  jobId: z.uuid(),
  status: z.enum(['new', 'scheduled', 'in_progress', 'blocked', 'completed', 'cancelled']),
});

export const assignJobSchema = z.object({
  jobId: z.uuid(),
  assigneeUserId: z.union([z.uuid(), z.null()]),
});

function transformOptionalString(max: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' ? value.trim() : ''))
    .refine((value) => value.length <= max, 'Must be ' + String(max) + ' characters or fewer.');
}

export const updateJobSchema = z.object({
  jobId: z.uuid(),
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(4000),
  customerName: z.string().trim().min(2).max(120),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  type: z.enum(['reactive', 'preventive', 'inspection', 'vendor']),
  dueAt: z
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
      'Provide a valid due date and time.',
    ),
  checklistSummary: transformOptionalString(1200),
  resolutionSummary: transformOptionalString(1200),
});
