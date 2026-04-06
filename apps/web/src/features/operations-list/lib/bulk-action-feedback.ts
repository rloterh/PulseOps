export function createBulkActionFeedback(input: {
  resourceLabel: string;
  selectedCount: number;
  updatedCount: number;
  statusLabel: string;
}) {
  const skippedCount = Math.max(input.selectedCount - input.updatedCount, 0);
  const pluralSuffix = input.resourceLabel === 'incident'
    ? input.updatedCount === 1
      ? ''
      : 's'
    : input.updatedCount === 1
      ? ''
      : 's';

  if (input.updatedCount === 0) {
    return {
      error: `No ${input.resourceLabel}${input.selectedCount === 1 ? '' : 's'} changed status. They may already match the selected state.`,
    };
  }

  if (skippedCount > 0) {
    return {
      success: `Updated ${String(input.updatedCount)} of ${String(input.selectedCount)} ${input.resourceLabel}${input.selectedCount === 1 ? '' : 's'} to ${input.statusLabel}. ${String(skippedCount)} already matched the selected state.`,
    };
  }

  return {
    success: `Updated ${String(input.updatedCount)} ${input.resourceLabel}${pluralSuffix} to ${input.statusLabel}.`,
  };
}
