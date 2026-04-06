import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { Database } from '@pulseops/supabase/types';
import {
  getCollaborationTargetFromDb,
  getRecordCommentsFromDb,
  getRecordWatchStateFromDb,
} from '@/features/collaboration/repositories/collaboration.repository';
import type { RecordEntityType } from '@/features/collaboration/types/collaboration.types';

export async function getRecordCollaboration(input: {
  tenantId: string;
  entityType: RecordEntityType;
  entityId: string;
  viewerId: string;
  viewerRole: Database['public']['Enums']['organization_role'];
}) {
  const supabase = await createSupabaseServerClient();
  const target = await getCollaborationTargetFromDb(supabase, input);

  if (!target) {
    return null;
  }

  const [comments, watchState] = await Promise.all([
    getRecordCommentsFromDb(supabase, input),
    getRecordWatchStateFromDb(supabase, input),
  ]);

  return {
    target,
    comments,
    watchState,
  };
}
