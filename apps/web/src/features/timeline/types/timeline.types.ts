import type { Database } from '@pulseops/supabase/types';

export type TimelineInsertInput =
  | {
      kind: 'incident';
      tenantId: string;
      parentId: string;
      eventType: Database['public']['Enums']['incident_timeline_event_type'];
      title: string;
      description: string;
      actorUserId: string;
      actorName: string;
    }
  | {
      kind: 'job';
      tenantId: string;
      parentId: string;
      eventType: Database['public']['Enums']['job_timeline_event_type'];
      title: string;
      description: string;
      actorUserId: string;
      actorName: string;
    };
