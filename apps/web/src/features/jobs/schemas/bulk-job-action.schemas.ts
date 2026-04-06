import { z } from 'zod';

export const bulkUpdateJobStatusSchema = z.object({
  jobIdsPayload: z.string().min(2),
  status: z.enum(['new', 'scheduled', 'in_progress', 'blocked', 'completed', 'cancelled']),
});

export function parseBulkJobIds(payload: string) {
  const parsed = z
    .string()
    .transform((value, context) => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        context.addIssue({
          code: 'custom',
          message: 'Invalid bulk payload.',
        });

        return z.NEVER;
      }
    })
    .pipe(z.array(z.uuid()).min(1).max(50))
    .safeParse(payload);

  if (!parsed.success) {
    return null;
  }

  return Array.from(new Set(parsed.data));
}
