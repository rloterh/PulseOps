export function serializeAnalyticsCsv(input: {
  columns: string[];
  rows: Record<string, string | number | boolean | null>[];
}) {
  const header = input.columns.map(escapeCsvCell).join(',');
  const body = input.rows
    .map((row) =>
      input.columns
        .map((column) => escapeCsvCell(row[column] ?? null))
        .join(','),
    )
    .join('\n');

  return body.length > 0 ? `${header}\n${body}\n` : `${header}\n`;
}

function escapeCsvCell(value: string | number | boolean | null) {
  if (value === null) {
    return '';
  }

  const normalized = String(value);
  if (
    normalized.includes(',') ||
    normalized.includes('"') ||
    normalized.includes('\n') ||
    normalized.includes('\r')
  ) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }

  return normalized;
}
