import type { IncidentListFilters } from '@/features/incidents/types/incident.types';
import type { JobListFilters } from '@/features/jobs/types/job.types';

export type SavedListViewResource = 'jobs' | 'incidents';

export interface SavedListViewFiltersByResource {
  jobs: JobListFilters;
  incidents: IncidentListFilters;
}

export interface SavedListViewRecord<TResource extends SavedListViewResource> {
  id: string;
  name: string;
  resourceType: TResource;
  filters: SavedListViewFiltersByResource[TResource];
  href: string;
  isActive: boolean;
}

export interface SavedListViewActionState {
  error?: string;
  success?: string;
}

export interface SavedListViewRow {
  id: string;
  name: string;
  resource_type: SavedListViewResource;
  filters: Record<string, unknown>;
}
