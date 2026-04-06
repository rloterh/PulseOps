export const LIST_DENSITY_OPTIONS = ['comfortable', 'compact'] as const;
export const LIST_PAGE_SIZE_OPTIONS = [10, 25, 50, 'all'] as const;

export type ListDensity = (typeof LIST_DENSITY_OPTIONS)[number];
export type ListPageSize = (typeof LIST_PAGE_SIZE_OPTIONS)[number];

export interface ListViewPreferences<TColumn extends string> {
  density: ListDensity;
  pageSize: ListPageSize;
  visibleColumns: TColumn[];
}

export interface ListViewPreferenceOptions<TColumn extends string> {
  allowedColumns: readonly TColumn[];
  defaultVisibleColumns: readonly TColumn[];
  defaultDensity?: ListDensity;
  defaultPageSize?: ListPageSize;
}

export function createDefaultListViewPreferences<TColumn extends string>(
  options: ListViewPreferenceOptions<TColumn>,
): ListViewPreferences<TColumn> {
  return {
    density: options.defaultDensity ?? 'comfortable',
    pageSize: options.defaultPageSize ?? 25,
    visibleColumns: [...options.defaultVisibleColumns],
  };
}

export function normalizeListViewPreferences<TColumn extends string>(
  input: unknown,
  options: ListViewPreferenceOptions<TColumn>,
): ListViewPreferences<TColumn> {
  const defaults = createDefaultListViewPreferences(options);

  if (!input || typeof input !== 'object') {
    return defaults;
  }

  const record = input as Record<string, unknown>;
  const density = isListDensity(record.density)
    ? record.density
    : defaults.density;
  const pageSize = isListPageSize(record.pageSize)
    ? record.pageSize
    : defaults.pageSize;
  const visibleColumns = normalizeVisibleColumns(record.visibleColumns, options);

  return {
    density,
    pageSize,
    visibleColumns,
  };
}

function normalizeVisibleColumns<TColumn extends string>(
  input: unknown,
  options: ListViewPreferenceOptions<TColumn>,
) {
  if (!Array.isArray(input)) {
    return [...options.defaultVisibleColumns];
  }

  const allowed = new Set(options.allowedColumns);
  const normalized = input.filter(
    (value): value is TColumn =>
      typeof value === 'string' && allowed.has(value as TColumn),
  );

  if (normalized.length === 0) {
    return [...options.defaultVisibleColumns];
  }

  return Array.from(new Set(normalized));
}

function isListDensity(value: unknown): value is ListDensity {
  return typeof value === 'string' && LIST_DENSITY_OPTIONS.includes(value as ListDensity);
}

function isListPageSize(value: unknown): value is ListPageSize {
  if (value === 'all') {
    return true;
  }

  return typeof value === 'number' && LIST_PAGE_SIZE_OPTIONS.includes(value as ListPageSize);
}
