import type { Database } from '@pulseops/supabase/types';

export type SlaEntityType = Database['public']['Enums']['sla_entity_type'];
export type SlaStatusCategory = Database['public']['Enums']['sla_status_category'];
export type SlaRiskLevel = Database['public']['Enums']['sla_risk_level'];
export type SlaEscalationState =
  Database['public']['Enums']['sla_escalation_state'];

export type SlaPolicyRecord =
  Database['public']['Tables']['sla_policies']['Row'];

export type WorkItemSlaSnapshot =
  Database['public']['Tables']['work_item_slas']['Row'];
