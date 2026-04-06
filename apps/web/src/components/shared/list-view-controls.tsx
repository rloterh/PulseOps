'use client';

import {
  LIST_PAGE_SIZE_OPTIONS,
  type ListDensity,
  type ListPageSize,
} from '@/features/operations-list/lib/list-view-preferences';

export function ListViewControls<TColumn extends string>({
  itemLabel,
  visibleCount,
  totalCount,
  density,
  onDensityChange,
  pageSize,
  onPageSizeChange,
  columns,
  visibleColumns,
  onToggleColumn,
}: {
  itemLabel: string;
  visibleCount: number;
  totalCount: number;
  density: ListDensity;
  onDensityChange: (density: ListDensity) => void;
  pageSize: ListPageSize;
  onPageSizeChange: (pageSize: ListPageSize) => void;
  columns: readonly { id: TColumn; label: string }[];
  visibleColumns: TColumn[];
  onToggleColumn: (column: TColumn) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/8 px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-white/54">
          Showing {String(visibleCount)} of {String(totalCount)} {itemLabel}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
            {(['comfortable', 'compact'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={density === option}
                onClick={() => {
                  onDensityChange(option);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                  density === option
                    ? 'bg-white text-neutral-950'
                    : 'text-white/62 hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/44">
            Rows
            <select
              value={String(pageSize)}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;
                onPageSizeChange(
                  nextValue === 'all'
                    ? 'all'
                    : (Number(nextValue) as Exclude<ListPageSize, 'all'>),
                );
              }}
              className="h-10 rounded-full border border-white/10 bg-black/20 px-3 text-sm normal-case tracking-normal text-white outline-none"
            >
              {LIST_PAGE_SIZE_OPTIONS.map((option) => (
                <option key={String(option)} value={String(option)}>
                  {option === 'all' ? 'All rows' : `${String(option)} rows`}
                </option>
              ))}
            </select>
          </label>

          <details className="group relative">
            <summary className="list-none rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/72 transition hover:bg-black/28 hover:text-white">
              Columns
            </summary>
            <div className="absolute right-0 z-20 mt-3 min-w-[14rem] rounded-[1.2rem] border border-white/10 bg-[#07111f] p-3 shadow-[0_18px_48px_rgba(2,6,23,0.42)]">
              <div className="space-y-2">
                {columns.map((column) => {
                  const checked = visibleColumns.includes(column.id);
                  const disabled = checked && visibleColumns.length === 1;

                  return (
                    <label
                      key={column.id}
                      className="flex items-center justify-between gap-3 rounded-[0.9rem] border border-white/6 bg-white/[0.03] px-3 py-2 text-sm text-white/74"
                    >
                      <span>{column.label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => {
                          onToggleColumn(column.id);
                        }}
                        className="h-4 w-4 accent-white disabled:opacity-50"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
