import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from '@pulseops/env/server';
import type { Database, Json } from '@pulseops/supabase/types';
import type { AiGenerationMeta } from '@/features/ai/types/ai.types';
import {
  completeAiRunInDb,
  createAiRunInDb,
  failAiRunInDb,
  findReusableAiRunFromDb,
  getAiFeedbackForRunFromDb,
} from '@/features/ai/repositories/ai.repository';
import { buildAiInputHash } from '@/features/ai/lib/build-ai-input-hash';
import type { AnalyticsAiInsights, AnalyticsAiResult } from '@/features/analytics/types/analytics.types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';

const TASK_KEY = 'analytics_overview';
const PROMPT_VERSION = 'sprint9-v1';
const REUSE_WINDOW_MS = 15 * 60 * 1000;

export async function generateAnalyticsAiRun(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    locationId: string | null;
    viewerId: string;
    filters: Record<string, string | boolean | null>;
    scopeLabel: string;
    rangeLabel: string;
    compareLabel: string | null;
    insights: AnalyticsAiInsights;
  },
): Promise<AnalyticsAiResult> {
  const providerConfig = resolveProviderConfig();
  const requestPayload = buildRequestPayload(input);
  const inputHash = buildAiInputHash(requestPayload);
  const reuseAfter = new Date(Date.now() - REUSE_WINDOW_MS).toISOString();

  const reusableRun = await findReusableAiRunFromDb(supabase, {
    organizationId: input.organizationId,
    locationId: input.locationId,
    taskKey: TASK_KEY,
    inputHash,
    reuseAfter,
  });

  if (reusableRun) {
    const feedback = await getAiFeedbackForRunFromDb(supabase, {
      runId: reusableRun.id,
      userId: input.viewerId,
    });

    return {
      generation: buildGenerationMeta({
        runId: reusableRun.id,
        provider: reusableRun.provider,
        model: reusableRun.model,
        promptVersion: reusableRun.prompt_version,
        generatedAt: reusableRun.completed_at ?? reusableRun.created_at,
        source: 'cached',
        fallbackReason: reusableRun.fallback_reason,
        feedbackRating:
          feedback?.rating === 'helpful' || feedback?.rating === 'not_helpful'
            ? feedback.rating
            : null,
      }),
      insights: parseStoredInsights(reusableRun.response_payload, input.insights),
    };
  }

  const pendingRun = await createAiRunInDb(supabase, {
    organizationId: input.organizationId,
    locationId: input.locationId,
    requestedByUserId: input.viewerId,
    taskKey: TASK_KEY,
    promptVersion: PROMPT_VERSION,
    provider: providerConfig.provider,
    model: providerConfig.model,
    inputHash,
    requestPayload: requestPayload as unknown as Json,
  });

  try {
    const completedRun = await completeAiRunInDb(supabase, {
      runId: pendingRun.id,
      provider: providerConfig.provider,
      model: providerConfig.model,
      responsePayload: input.insights as unknown as Json,
      fallbackReason: providerConfig.fallbackReason,
    });

    return {
      generation: buildGenerationMeta({
        runId: completedRun.id,
        provider: completedRun.provider,
        model: completedRun.model,
        promptVersion: completedRun.prompt_version,
        generatedAt: completedRun.completed_at ?? completedRun.created_at,
        source: 'fresh',
        fallbackReason: completedRun.fallback_reason,
        feedbackRating: null,
      }),
      insights: input.insights,
    };
  } catch (error) {
    await failAiRunInDb(supabase, {
      runId: pendingRun.id,
      errorMessage: error instanceof Error ? error.message : 'Unknown AI generation failure.',
      fallbackReason: providerConfig.fallbackReason ?? 'Deterministic AI run failed unexpectedly.',
    });

    return {
      generation: buildGenerationMeta({
        runId: null,
        provider: providerConfig.provider,
        model: providerConfig.model,
        promptVersion: PROMPT_VERSION,
        generatedAt: null,
        source: 'fresh',
        fallbackReason:
          providerConfig.fallbackReason ?? 'Deterministic AI run failed, so the live view is using the in-memory fallback.',
        feedbackRating: null,
      }),
      insights: input.insights,
    };
  }
}

function resolveProviderConfig() {
  const env = getServerEnv();

  if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY) {
    return {
      provider: 'pulseops-deterministic',
      model: 'heuristic-v1',
      fallbackReason:
        'External AI provider is configured, but this branch keeps deterministic analytics generation active for operational consistency.',
    };
  }

  return {
    provider: 'pulseops-deterministic',
    model: 'heuristic-v1',
    fallbackReason: null,
  };
}

function buildRequestPayload(input: {
  filters: Record<string, string | boolean | null>;
  scopeLabel: string;
  rangeLabel: string;
  compareLabel: string | null;
  insights: AnalyticsAiInsights;
}) {
  return {
    taskKey: TASK_KEY,
    promptVersion: PROMPT_VERSION,
    filters: input.filters,
    scopeLabel: input.scopeLabel,
    rangeLabel: input.rangeLabel,
    compareLabel: input.compareLabel,
    executiveSummary: input.insights.executiveSummary,
    branchSummaryCards: input.insights.branchSummaryCards,
    lateJobRiskSignals: input.insights.lateJobRiskSignals,
  };
}

function buildGenerationMeta(input: {
  runId: string | null;
  provider: string;
  model: string;
  promptVersion: string;
  generatedAt: string | null;
  source: 'fresh' | 'cached';
  fallbackReason: string | null;
  feedbackRating: 'helpful' | 'not_helpful' | null;
}): AiGenerationMeta {
  return {
    runId: input.runId,
    providerLabel: input.provider,
    modelLabel: input.model,
    promptVersion: input.promptVersion,
    generatedAtValue: input.generatedAt,
    generatedAtLabel: input.generatedAt ? formatDateTimeLabel(input.generatedAt) : 'Not recorded',
    source: input.source,
    fallbackReason: input.fallbackReason,
    feedbackRating: input.feedbackRating,
  };
}

function parseStoredInsights(
  payload: Json | null,
  fallback: AnalyticsAiInsights,
): AnalyticsAiInsights {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return fallback;
  }

  return payload as unknown as AnalyticsAiInsights;
}
