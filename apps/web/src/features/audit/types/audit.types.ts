export interface AuditLogListItem {
  id: string;
  action: string;
  actorName: string;
  actorType: 'user' | 'system' | 'service';
  entityType: string;
  entityLabel: string | null;
  scope: string | null;
  createdAtLabel: string;
  locationName: string | null;
}

export interface AdminActivitySummary {
  total: number;
  incidentActions: number;
  escalationActions: number;
  billingActions: number;
}
