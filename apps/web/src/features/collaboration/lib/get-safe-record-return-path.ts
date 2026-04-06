import type { Route } from 'next';
import { getSafeNextPath } from '@/lib/auth/get-safe-next-path';
import type { RecordEntityType } from '@/features/collaboration/types/collaboration.types';

export function getRecordDetailPath(
  entityType: RecordEntityType,
  entityId: string,
): Route {
  if (entityType === 'incident') {
    return `/incidents/${entityId}` as Route;
  }

  if (entityType === 'job') {
    return `/jobs/${entityId}` as Route;
  }

  return `/tasks/${entityId}` as Route;
}

export function getSafeRecordReturnPath(
  entityType: RecordEntityType,
  entityId: string,
  returnPath: string | null | undefined,
): Route {
  return getSafeNextPath(returnPath, getRecordDetailPath(entityType, entityId));
}
