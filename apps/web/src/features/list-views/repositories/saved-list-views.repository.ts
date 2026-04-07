import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@pulseops/supabase/types';
import type {
  SavedListViewResource,
  SavedListViewRow,
} from '@/features/list-views/types/list-view.types';

export async function getSavedListViewsFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    viewerId: string;
    resourceType: SavedListViewResource;
  },
): Promise<SavedListViewRow[]> {
  const { data, error } = await supabase
    .from('saved_list_views')
    .select('id, name, resource_type, filters')
    .eq('organization_id', input.tenantId)
    .eq('user_id', input.viewerId)
    .eq('resource_type', input.resourceType)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    resource_type: row.resource_type as SavedListViewResource,
    filters: toFilterRecord(row.filters),
  }));
}

export async function getSavedListViewsCountFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    viewerId: string;
  },
) {
  const { count, error } = await supabase
    .from('saved_list_views')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', input.tenantId)
    .eq('user_id', input.viewerId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function createSavedListViewInDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    viewerId: string;
    resourceType: SavedListViewResource;
    name: string;
    filters: Record<string, unknown>;
  },
) {
  const { data, error } = await supabase
    .from('saved_list_views')
    .insert({
      organization_id: input.tenantId,
      user_id: input.viewerId,
      resource_type: input.resourceType,
      name: input.name.trim(),
      filters: input.filters as Json,
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteSavedListViewFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    viewerId: string;
    resourceType: SavedListViewResource;
    savedViewId: string;
  },
) {
  const { error } = await supabase
    .from('saved_list_views')
    .delete()
    .eq('organization_id', input.tenantId)
    .eq('user_id', input.viewerId)
    .eq('resource_type', input.resourceType)
    .eq('id', input.savedViewId);

  if (error) {
    throw new Error(error.message);
  }
}

function toFilterRecord(filters: Database['public']['Tables']['saved_list_views']['Row']['filters']) {
  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
    return {};
  }

  return filters as Record<string, unknown>;
}
