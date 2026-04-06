import type { MemberOption } from '@/lib/organizations/get-member-options';
import { canUseInternalNotes } from '@/features/collaboration/lib/collaboration-permissions';
import type {
  CollaborationComment,
  RecordEntityType,
} from '@/features/collaboration/types/collaboration.types';
import type { Database } from '@pulseops/supabase/types';
import { RecordCommentComposer } from './record-comment-composer';
import { RecordCommentFeed } from './record-comment-feed';

export function RecordCollaborationPanel({
  entityType,
  entityId,
  returnPath,
  comments,
  mentionSuggestions,
  viewerRole,
}: {
  entityType: RecordEntityType;
  entityId: string;
  returnPath: string;
  comments: CollaborationComment[];
  mentionSuggestions: MemberOption[];
  viewerRole: Database['public']['Enums']['organization_role'];
}) {
  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-white">Collaboration</h2>
        <p className="mt-2 text-sm leading-6 text-white/46">
          Keep the operator conversation attached to the record so follow-through survives shift changes and branch handoffs.
        </p>
      </div>

      <div className="space-y-6">
        <RecordCommentComposer
          entityType={entityType}
          entityId={entityId}
          returnPath={returnPath}
          canPostInternalNotes={canUseInternalNotes(viewerRole)}
          mentionSuggestions={mentionSuggestions}
        />
        <RecordCommentFeed
          entityType={entityType}
          entityId={entityId}
          returnPath={returnPath}
          comments={comments}
        />
      </div>
    </section>
  );
}
