import { NextResponse } from 'next/server';
import { z } from 'zod';
import { insertAuditLogInDb } from '@/features/audit/repositories/audit.repository';
import {
  getAiRunByIdFromDb,
  upsertAiFeedbackInDb,
} from '@/features/ai/repositories/ai.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

const feedbackSchema = z.object({
  runId: z.uuid(),
  rating: z.enum(['helpful', 'not_helpful']),
  comment: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const context = await requireTenantMember();
  const parsed = feedbackSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid feedback payload.' }, { status: 400 });
  }

  const run = await getAiRunByIdFromDb(context.supabase, {
    organizationId: context.tenantId,
    runId: parsed.data.runId,
  });

  if (!run) {
    return NextResponse.json({ error: 'AI run not found.' }, { status: 404 });
  }

  const feedback = await upsertAiFeedbackInDb(context.supabase, {
    aiRunId: run.id,
    organizationId: context.tenantId,
    userId: context.viewerId,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  });

  await insertAuditLogInDb(context.supabase, {
    tenantId: context.tenantId,
    locationId: run.location_id,
    actorUserId: context.viewerId,
    action: 'ai.feedback_submitted',
    entityType: 'ai_run',
    entityId: run.id,
    entityLabel: run.task_key,
    scope: 'analytics',
    metadata: {
      rating: feedback.rating,
      taskKey: run.task_key,
      provider: run.provider,
      model: run.model,
    },
  });

  return NextResponse.json({
    ok: true,
    rating: feedback.rating,
  });
}
