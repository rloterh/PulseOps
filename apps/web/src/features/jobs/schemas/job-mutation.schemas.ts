import { z } from 'zod';

export const updateJobStatusSchema = z.object({
  jobId: z.uuid(),
  status: z.enum(['new', 'scheduled', 'in_progress', 'blocked', 'completed', 'cancelled']),
});

export const assignJobSchema = z.object({
  jobId: z.uuid(),
  assigneeUserId: z.union([z.uuid(), z.null()]),
});
