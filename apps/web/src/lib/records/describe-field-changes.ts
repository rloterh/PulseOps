interface FieldChange {
  label: string;
  before: string | null | undefined;
  after: string | null | undefined;
}

function normalizeValue(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatValue(value: string | null) {
  return value ?? 'Not set';
}

export function describeFieldChanges(changes: FieldChange[]) {
  const lines = changes
    .map((change) => ({
      label: change.label,
      before: normalizeValue(change.before),
      after: normalizeValue(change.after),
    }))
    .filter((change) => change.before !== change.after)
    .map(
      (change) =>
        `${change.label}: ${formatValue(change.before)} -> ${formatValue(change.after)}.`,
    );

  return lines.join(' ');
}
