import { z } from 'zod';

export const createRecordCommentSchema = z.object({
  entityType: z.enum(['incident', 'job', 'task']),
  entityId: z.uuid(),
  parentCommentId: z
    .union([z.uuid(), z.literal(''), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' && value.length > 0 ? value : null)),
  kind: z.enum(['comment', 'internal_note']),
  body: z.string().trim().min(3).max(4000),
  returnPath: z.string().trim().min(1),
});

export const deleteRecordCommentSchema = z.object({
  commentId: z.uuid(),
  entityType: z.enum(['incident', 'job', 'task']),
  entityId: z.uuid(),
  returnPath: z.string().trim().min(1),
});

export const recordWatchActionSchema = z.object({
  entityType: z.enum(['incident', 'job', 'task']),
  entityId: z.uuid(),
  returnPath: z.string().trim().min(1),
});
