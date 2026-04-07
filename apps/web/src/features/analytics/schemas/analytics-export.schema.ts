import { z } from 'zod';

export const analyticsExportSchema = z.object({
  dataset: z.enum(['branches', 'sla']),
});

export type AnalyticsExportInput = z.infer<typeof analyticsExportSchema>;
