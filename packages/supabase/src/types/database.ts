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
          organization_id: string;
          role: Database['public']['Enums']['organization_role'];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role?: Database['public']['Enums']['organization_role'];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
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
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
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
      has_org_role: {
        Args: {
          allowed_roles: Database['public']['Enums']['organization_role'][];
          target_org_id: string;
        };
        Returns: boolean;
      };
      is_member_of_org: {
        Args: {
          target_org_id: string;
        };
        Returns: boolean;
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
    };
    CompositeTypes: Record<string, never>;
  };
}
