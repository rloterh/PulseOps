import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@pulseops/supabase/types';
import type { AiFeedbackRating } from '@/features/ai/types/ai.types';

type AiRunRow = Database['public']['Tables']['ai_runs']['Row'];
type AiFeedbackRow = Database['public']['Tables']['ai_feedback']['Row'];

export async function findReusableAiRunFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    locationId: string | null;
    taskKey: string;
    inputHash: string;
    reuseAfter: string;
  },
): Promise<AiRunRow | null> {
  let query = supabase
    .from('ai_runs')
    .select('*')
    .eq('organization_id', input.organizationId)
    .eq('task_key', input.taskKey)
    .eq('input_hash', input.inputHash)
    .eq('status', 'completed')
    .gte('completed_at', input.reuseAfter)
    .order('completed_at', { ascending: false })
    .limit(1);

  query = input.locationId
    ? query.eq('location_id', input.locationId)
    : query.is('location_id', null);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAiRunByIdFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    runId: string;
  },
): Promise<AiRunRow | null> {
  const { data, error } = await supabase
    .from('ai_runs')
    .select('*')
    .eq('organization_id', input.organizationId)
    .eq('id', input.runId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createAiRunInDb(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    locationId: string | null;
    requestedByUserId: string;
    taskKey: string;
    promptVersion: string;
    provider: string;
    model: string;
    inputHash: string;
    requestPayload: Json;
  },
): Promise<AiRunRow> {
  const { data, error } = await supabase
    .from('ai_runs')
    .insert({
      organization_id: input.organizationId,
      location_id: input.locationId,
      requested_by_user_id: input.requestedByUserId,
      task_key: input.taskKey,
      prompt_version: input.promptVersion,
      provider: input.provider,
      model: input.model,
      input_hash: input.inputHash,
      request_payload: input.requestPayload,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function completeAiRunInDb(
  supabase: SupabaseClient<Database>,
  input: {
    runId: string;
    provider: string;
    model: string;
    responsePayload: Json;
    fallbackReason?: string | null;
  },
): Promise<AiRunRow> {
  const { data, error } = await supabase
    .from('ai_runs')
    .update({
      provider: input.provider,
      model: input.model,
      status: 'completed',
      response_payload: input.responsePayload,
      fallback_reason: input.fallbackReason ?? null,
      error_message: null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', input.runId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function failAiRunInDb(
  supabase: SupabaseClient<Database>,
  input: {
    runId: string;
    errorMessage: string;
    fallbackReason?: string | null;
  },
) {
  const { error } = await supabase
    .from('ai_runs')
    .update({
      status: 'failed',
      fallback_reason: input.fallbackReason ?? null,
      error_message: input.errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq('id', input.runId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAiFeedbackForRunFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    runId: string;
    userId: string;
  },
): Promise<AiFeedbackRow | null> {
  const { data, error } = await supabase
    .from('ai_feedback')
    .select('*')
    .eq('ai_run_id', input.runId)
    .eq('user_id', input.userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertAiFeedbackInDb(
  supabase: SupabaseClient<Database>,
  input: {
    aiRunId: string;
    organizationId: string;
    userId: string;
    rating: AiFeedbackRating;
    comment?: string | null;
  },
): Promise<AiFeedbackRow> {
  const { data, error } = await supabase
    .from('ai_feedback')
    .upsert(
      {
        ai_run_id: input.aiRunId,
        organization_id: input.organizationId,
        user_id: input.userId,
        rating: input.rating,
        comment: input.comment ?? null,
      },
      {
        onConflict: 'ai_run_id,user_id',
      },
    )
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

