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
  createdAt: string;
  locationName: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
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

export interface AuditActivityPagination {
  page: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
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
