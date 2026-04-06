import { z } from 'zod';

export const updateIncidentStatusSchema = z.object({
  incidentId: z.uuid(),
  status: z.enum(['open', 'investigating', 'monitoring', 'resolved', 'closed']),
});

export const assignIncidentSchema = z.object({
  incidentId: z.uuid(),
  assigneeUserId: z.union([z.uuid(), z.null()]),
});
