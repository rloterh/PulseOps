export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      incident_timeline_events: {
        Row: {
          actor_name: string;
          actor_user_id: string | null;
          created_at: string;
          description: string;
          event_type: Database['public']['Enums']['incident_timeline_event_type'];
          id: string;
          incident_id: string;
          organization_id: string;
          title: string;
        };
        Insert: {
          actor_name?: string;
          actor_user_id?: string | null;
          created_at?: string;
          description: string;
          event_type: Database['public']['Enums']['incident_timeline_event_type'];
          id?: string;
          incident_id: string;
          organization_id: string;
          title: string;
        };
        Update: {
          actor_name?: string;
          actor_user_id?: string | null;
          created_at?: string;
          description?: string;
          event_type?: Database['public']['Enums']['incident_timeline_event_type'];
          id?: string;
          incident_id?: string;
          organization_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incident_timeline_events_actor_user_id_fkey';
            columns: ['actor_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incident_timeline_events_incident_id_fkey';
            columns: ['incident_id'];
            referencedRelation: 'incidents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incident_timeline_events_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      incidents: {
        Row: {
          assignee_user_id: string | null;
          created_at: string;
          customer_name: string;
          id: string;
          impact_summary: string;
          location_id: string;
          next_action: string;
          opened_at: string;
          organization_id: string;
          owner_user_id: string;
          reference: string;
          severity: Database['public']['Enums']['incident_severity'];
          site_name: string;
          sla_risk: boolean;
          status: Database['public']['Enums']['incident_status'];
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          assignee_user_id?: string | null;
          created_at?: string;
          customer_name: string;
          id?: string;
          impact_summary?: string;
          location_id: string;
          next_action?: string;
          opened_at?: string;
          organization_id: string;
          owner_user_id: string;
          reference: string;
          severity?: Database['public']['Enums']['incident_severity'];
          site_name: string;
          sla_risk?: boolean;
          status?: Database['public']['Enums']['incident_status'];
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          assignee_user_id?: string | null;
          created_at?: string;
          customer_name?: string;
          id?: string;
          impact_summary?: string;
          location_id?: string;
          next_action?: string;
          opened_at?: string;
          organization_id?: string;
          owner_user_id?: string;
          reference?: string;
          severity?: Database['public']['Enums']['incident_severity'];
          site_name?: string;
          sla_risk?: boolean;
          status?: Database['public']['Enums']['incident_status'];
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incidents_assignee_user_id_fkey';
            columns: ['assignee_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incidents_location_id_fkey';
            columns: ['location_id'];
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incidents_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incidents_owner_user_id_fkey';
            columns: ['owner_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      job_timeline_events: {
        Row: {
          actor_name: string;
          actor_user_id: string | null;
          created_at: string;
          description: string;
          event_type: Database['public']['Enums']['job_timeline_event_type'];
          id: string;
          job_id: string;
          organization_id: string;
          title: string;
        };
        Insert: {
          actor_name?: string;
          actor_user_id?: string | null;
          created_at?: string;
          description: string;
          event_type: Database['public']['Enums']['job_timeline_event_type'];
          id?: string;
          job_id: string;
          organization_id: string;
          title: string;
        };
        Update: {
          actor_name?: string;
          actor_user_id?: string | null;
          created_at?: string;
          description?: string;
          event_type?: Database['public']['Enums']['job_timeline_event_type'];
          id?: string;
          job_id?: string;
          organization_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'job_timeline_events_actor_user_id_fkey';
            columns: ['actor_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'job_timeline_events_job_id_fkey';
            columns: ['job_id'];
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'job_timeline_events_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      jobs: {
        Row: {
          assignee_user_id: string | null;
          checklist_summary: string;
          created_at: string;
          created_by_user_id: string;
          customer_name: string;
          due_at: string | null;
          id: string;
          incident_id: string | null;
          location_id: string;
          organization_id: string;
          priority: Database['public']['Enums']['job_priority'];
          reference: string;
          resolution_summary: string | null;
          site_name: string;
          status: Database['public']['Enums']['job_status'];
          summary: string;
          title: string;
          type: Database['public']['Enums']['job_type'];
          updated_at: string;
        };
        Insert: {
          assignee_user_id?: string | null;
          checklist_summary?: string;
          created_at?: string;
          created_by_user_id: string;
          customer_name: string;
          due_at?: string | null;
          id?: string;
          incident_id?: string | null;
          location_id: string;
          organization_id: string;
          priority?: Database['public']['Enums']['job_priority'];
          reference: string;
          resolution_summary?: string | null;
          site_name: string;
          status?: Database['public']['Enums']['job_status'];
          summary: string;
          title: string;
          type?: Database['public']['Enums']['job_type'];
          updated_at?: string;
        };
        Update: {
          assignee_user_id?: string | null;
          checklist_summary?: string;
          created_at?: string;
          created_by_user_id?: string;
          customer_name?: string;
          due_at?: string | null;
          id?: string;
          incident_id?: string | null;
          location_id?: string;
          organization_id?: string;
          priority?: Database['public']['Enums']['job_priority'];
          reference?: string;
          resolution_summary?: string | null;
          site_name?: string;
          status?: Database['public']['Enums']['job_status'];
          summary?: string;
          title?: string;
          type?: Database['public']['Enums']['job_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'jobs_assignee_user_id_fkey';
            columns: ['assignee_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'jobs_created_by_user_id_fkey';
            columns: ['created_by_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'jobs_incident_id_fkey';
            columns: ['incident_id'];
            referencedRelation: 'incidents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'jobs_location_id_fkey';
            columns: ['location_id'];
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'jobs_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      record_comment_mentions: {
        Row: {
          comment_id: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          location_id: string;
          mentioned_by_user_id: string;
          mentioned_user_id: string;
          organization_id: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          location_id: string;
          mentioned_by_user_id: string;
          mentioned_user_id: string;
          organization_id: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          location_id?: string;
          mentioned_by_user_id?: string;
          mentioned_user_id?: string;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'record_comment_mentions_comment_id_fkey';
            columns: ['comment_id'];
            referencedRelation: 'record_comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_comment_mentions_location_id_fkey';
            columns: ['location_id'];
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_comment_mentions_mentioned_by_user_id_fkey';
            columns: ['mentioned_by_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_comment_mentions_mentioned_user_id_fkey';
            columns: ['mentioned_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_comment_mentions_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      record_comments: {
        Row: {
          author_user_id: string;
          body: string;
          body_text: string;
          created_at: string;
          deleted_at: string | null;
          edited_at: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          is_edited: boolean;
          kind: string;
          location_id: string;
          organization_id: string;
          parent_comment_id: string | null;
          updated_at: string;
        };
        Insert: {
          author_user_id: string;
          body: string;
          body_text: string;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          is_edited?: boolean;
          kind?: string;
          location_id: string;
          organization_id: string;
          parent_comment_id?: string | null;
          updated_at?: string;
        };
        Update: {
          author_user_id?: string;
          body?: string;
          body_text?: string;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          is_edited?: boolean;
          kind?: string;
          location_id?: string;
          organization_id?: string;
          parent_comment_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'record_comments_author_user_id_fkey';
            columns: ['author_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_comments_location_id_fkey';
            columns: ['location_id'];
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_comments_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_comments_parent_comment_id_fkey';
            columns: ['parent_comment_id'];
            referencedRelation: 'record_comments';
            referencedColumns: ['id'];
          },
        ];
      };
      record_notifications: {
        Row: {
          actor_user_id: string | null;
          archived_at: string | null;
          body: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          event_type: string;
          href: string;
          id: string;
          location_id: string;
          organization_id: string;
          read_at: string | null;
          recipient_user_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          actor_user_id?: string | null;
          archived_at?: string | null;
          body: string;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          event_type: string;
          href: string;
          id?: string;
          location_id: string;
          organization_id: string;
          read_at?: string | null;
          recipient_user_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          actor_user_id?: string | null;
          archived_at?: string | null;
          body?: string;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          event_type?: string;
          href?: string;
          id?: string;
          location_id?: string;
          organization_id?: string;
          read_at?: string | null;
          recipient_user_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'record_notifications_actor_user_id_fkey';
            columns: ['actor_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_notifications_location_id_fkey';
            columns: ['location_id'];
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_notifications_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_notifications_recipient_user_id_fkey';
            columns: ['recipient_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_list_views: {
        Row: {
          created_at: string;
          filters: Json;
          id: string;
          name: string;
          organization_id: string;
          resource_type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          filters?: Json;
          id?: string;
          name: string;
          organization_id: string;
          resource_type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          filters?: Json;
          id?: string;
          name?: string;
          organization_id?: string;
          resource_type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_list_views_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_list_views_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      record_watchers: {
        Row: {
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          is_muted: boolean;
          location_id: string;
          muted_at: string | null;
          organization_id: string;
          source: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          is_muted?: boolean;
          location_id: string;
          muted_at?: string | null;
          organization_id: string;
          source?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          is_muted?: boolean;
          location_id?: string;
          muted_at?: string | null;
          organization_id?: string;
          source?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'record_watchers_location_id_fkey';
            columns: ['location_id'];
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_watchers_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_watchers_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      task_timeline_events: {
        Row: {
          actor_name: string;
          actor_user_id: string | null;
          created_at: string;
          description: string;
          event_type: Database['public']['Enums']['task_timeline_event_type'];
          id: string;
          organization_id: string;
          task_id: string;
          title: string;
        };
        Insert: {
          actor_name?: string;
          actor_user_id?: string | null;
          created_at?: string;
          description: string;
          event_type: Database['public']['Enums']['task_timeline_event_type'];
          id?: string;
          organization_id: string;
          task_id: string;
          title: string;
        };
        Update: {
          actor_name?: string;
          actor_user_id?: string | null;
          created_at?: string;
          description?: string;
          event_type?: Database['public']['Enums']['task_timeline_event_type'];
          id?: string;
          organization_id?: string;
          task_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'task_timeline_events_actor_user_id_fkey';
            columns: ['actor_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_timeline_events_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_timeline_events_task_id_fkey';
            columns: ['task_id'];
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          assignee_user_id: string | null;
          completion_summary: string | null;
          created_at: string;
          created_by_user_id: string;
          due_at: string | null;
          id: string;
          linked_incident_id: string | null;
          linked_job_id: string | null;
          location_id: string;
          organization_id: string;
          priority: Database['public']['Enums']['job_priority'];
          reference: string;
          status: Database['public']['Enums']['task_status'];
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          assignee_user_id?: string | null;
          completion_summary?: string | null;
          created_at?: string;
          created_by_user_id: string;
          due_at?: string | null;
          id?: string;
          linked_incident_id?: string | null;
          linked_job_id?: string | null;
          location_id: string;
          organization_id: string;
          priority?: Database['public']['Enums']['job_priority'];
          reference: string;
          status?: Database['public']['Enums']['task_status'];
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          assignee_user_id?: string | null;
          completion_summary?: string | null;
          created_at?: string;
          created_by_user_id?: string;
          due_at?: string | null;
          id?: string;
          linked_incident_id?: string | null;
          linked_job_id?: string | null;
          location_id?: string;
          organization_id?: string;
          priority?: Database['public']['Enums']['job_priority'];
          reference?: string;
          status?: Database['public']['Enums']['task_status'];
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_assignee_user_id_fkey';
            columns: ['assignee_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_created_by_user_id_fkey';
            columns: ['created_by_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_linked_incident_id_fkey';
            columns: ['linked_incident_id'];
            referencedRelation: 'incidents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_linked_job_id_fkey';
            columns: ['linked_job_id'];
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_location_id_fkey';
            columns: ['location_id'];
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      location_member_access: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          location_id: string;
          organization_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          location_id: string;
          organization_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          location_id?: string;
          organization_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'location_member_access_location_id_fkey';
            columns: ['location_id'];
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'location_member_access_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'location_member_access_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      locations: {
        Row: {
          code: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          organization_id: string;
          timezone: string | null;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          organization_id: string;
          timezone?: string | null;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          organization_id?: string;
          timezone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'locations_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      organization_members: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          organization_id: string;
          role: Database['public']['Enums']['organization_role'];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          organization_id: string;
          role?: Database['public']['Enums']['organization_role'];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          organization_id?: string;
          role?: Database['public']['Enums']['organization_role'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organization_members_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organizations_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      bootstrap_organization: {
        Args: {
          default_location_code?: string;
          default_location_name?: string;
          default_location_timezone?: string;
          org_name: string;
          org_slug: string;
        };
        Returns: string;
      };
      can_bootstrap_org_membership: {
        Args: {
          target_org_id: string;
          target_user_id: string;
        };
        Returns: boolean;
      };
      can_user_access_location: {
        Args: {
          target_location_id: string;
          target_org_id: string;
          target_user_id: string;
        };
        Returns: boolean;
      };
      can_view_profile: {
        Args: {
          target_user_id: string;
        };
        Returns: boolean;
      };
      has_org_role: {
        Args: {
          allowed_roles: Database['public']['Enums']['organization_role'][];
          target_org_id: string;
        };
        Returns: boolean;
      };
      is_active_member_user_of_org: {
        Args: {
          target_org_id: string;
          target_user_id: string;
        };
        Returns: boolean;
      };
      is_member_of_org: {
        Args: {
          target_org_id: string;
        };
        Returns: boolean;
      };
      is_privileged_member_of_org: {
        Args: {
          target_org_id: string;
        };
        Returns: boolean;
      };
      next_job_reference: {
        Args: {
          target_org_id: string;
        };
        Returns: string;
      };
      next_incident_reference: {
        Args: {
          target_org_id: string;
        };
        Returns: string;
      };
      next_task_reference: {
        Args: {
          target_org_id: string;
        };
        Returns: string;
      };
      search_assignable_directory: {
        Args: {
          p_limit?: number;
          p_location_id?: string | null;
          p_org_id: string;
          p_query?: string;
        };
        Returns: {
          avatar_url: string | null;
          email: string | null;
          full_name: string | null;
          is_current_user: boolean;
          location_id: string | null;
          location_name: string | null;
          org_role: Database['public']['Enums']['organization_role'];
          user_id: string;
        }[];
      };
    };
    Enums: {
      incident_severity: 'critical' | 'high' | 'medium' | 'low';
      incident_status:
        | 'open'
        | 'investigating'
        | 'monitoring'
        | 'resolved'
        | 'closed';
      incident_timeline_event_type:
        | 'created'
        | 'assignment'
        | 'status_change'
        | 'note'
        | 'resolution';
      job_priority: 'urgent' | 'high' | 'medium' | 'low';
      job_status:
        | 'new'
        | 'scheduled'
        | 'in_progress'
        | 'blocked'
        | 'completed'
        | 'cancelled';
      job_timeline_event_type:
        | 'created'
        | 'scheduled'
        | 'assignment'
        | 'status_change'
        | 'note'
        | 'completed';
      job_type: 'reactive' | 'preventive' | 'inspection' | 'vendor';
      organization_role: 'owner' | 'admin' | 'manager' | 'agent';
      task_status: 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
      task_timeline_event_type:
        | 'created'
        | 'assignment'
        | 'status_change'
        | 'note'
        | 'completed';
    };
    CompositeTypes: Record<string, never>;
  };
}
