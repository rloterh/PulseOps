import { z } from 'zod';

function transformOptionalString(max: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' ? value.trim() : ''))
    .refine((value) => value.length <= max, 'Must be ' + String(max) + ' characters or fewer.');
}

export const updateTaskStatusSchema = z.object({
  taskId: z.uuid(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'completed', 'cancelled']),
});

export const assignTaskSchema = z.object({
  taskId: z.uuid(),
  assigneeUserId: z.union([z.uuid(), z.null()]),
});

export const updateTaskSchema = z
  .object({
    taskId: z.uuid(),
    title: z.string().trim().min(3).max(160),
    summary: z.string().trim().min(10).max(4000),
    priority: z.enum(['urgent', 'high', 'medium', 'low']),
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
    linkedEntityKind: z.enum(['none', 'incident', 'job']),
    linkedEntityId: z
      .union([z.uuid(), z.literal(''), z.null(), z.undefined()])
      .transform((value) => (typeof value === 'string' && value.length > 0 ? value : null)),
    completionSummary: transformOptionalString(1200),
  })
  .superRefine((value, context) => {
    if (value.linkedEntityKind !== 'none' && !value.linkedEntityId) {
      context.addIssue({
        code: 'custom',
        path: ['linkedEntityId'],
        message: 'Choose the linked record you want this task to track.',
      });
    }
  });
