export interface AuditLogListItem {
  id: string;
  action: string;
  actionLabel: string;
  actorName: string;
  actorUserId: string | null;
  actorType: 'user' | 'system' | 'service';
  entityType: string;
  entityLabel: string | null;
  scope: string | null;
  locationId: string | null;
  createdAtLabel: string;
  locationName: string | null;
}

export interface AdminActivitySummary {
  total: number;
  incidentActions: number;
  escalationActions: number;
  billingActions: number;
}

export interface AuditActivityFilters {
  q: string;
  scope: string;
  actorUserId: string;
  entityType: string;
  locationId: string;
}

export interface AuditFilterOption {
  value: string;
  label: string;
}

export interface AuditActivityFilterOptions {
  actors: AuditFilterOption[];
  scopes: AuditFilterOption[];
  entityTypes: AuditFilterOption[];
  locations: AuditFilterOption[];
}
