import { NextResponse } from 'next/server';
import { z } from 'zod';
import { insertAuditLogInDb } from '@/features/audit/repositories/audit.repository';
import {
  getAiRunByIdFromDb,
  upsertAiFeedbackInDb,
} from '@/features/ai/repositories/ai.repository';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { log } from '@/lib/observability/logger';
import { buildRateLimitHeaders, enforceRateLimit } from '@/lib/security/rate-limit';
import { getRequestFingerprint } from '@/lib/security/request-fingerprint';
import { SafeError, createSafeErrorResponse } from '@/lib/security/safe-error';

const feedbackSchema = z.object({
  runId: z.uuid(),
  rating: z.enum(['helpful', 'not_helpful']),
  comment: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const context = await requireTenantMember();
  const fingerprint = getRequestFingerprint(request.headers);

  let rateLimitHeaders: Record<string, string> | undefined;

  try {
    const rateLimit = enforceRateLimit({
      bucket: 'ai:feedback',
      fingerprintKey: fingerprint.key,
      actorId: context.viewerId,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    });
    rateLimitHeaders = buildRateLimitHeaders(rateLimit);

    const parsed = feedbackSchema.safeParse(await request.json());

    if (!parsed.success) {
      throw new SafeError({
        code: 'INVALID_FEEDBACK_PAYLOAD',
        userMessage: 'Invalid feedback payload.',
      });
    }

    const run = await getAiRunByIdFromDb(context.supabase, {
      organizationId: context.tenantId,
      runId: parsed.data.runId,
    });

    if (!run) {
      throw new SafeError({
        code: 'AI_RUN_NOT_FOUND',
        status: 404,
        userMessage: 'AI run not found.',
      });
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

    return NextResponse.json(
      {
        ok: true,
        rating: feedback.rating,
      },
      {
        headers: rateLimitHeaders,
      },
    );
  } catch (error) {
    log(error instanceof SafeError ? 'warn' : 'error', {
      message: 'Failed to submit AI feedback.',
      context: {
        tenantId: context.tenantId,
        viewerId: context.viewerId,
        branchId: context.branchId,
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return createSafeErrorResponse(
      error,
      rateLimitHeaders ? { headers: rateLimitHeaders } : {},
    );
  }
}
