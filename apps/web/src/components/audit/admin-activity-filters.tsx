import type {
  AuditActivityFilterOptions,
  AuditActivityFilters,
} from '@/features/audit/types/audit.types';

export function AdminActivityFilters({
  filters,
  options,
}: {
  filters: AuditActivityFilters;
  options: AuditActivityFilterOptions;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Filter activity</h2>
          <p className="mt-2 text-sm leading-6 text-white/52">
            Narrow the audit stream by actor, scope, branch, or target type to review
            incident escalations and sensitive commercial changes faster.
          </p>
        </div>
      </div>

      <form className="mt-5 grid gap-3 xl:grid-cols-5">
        <label className="space-y-2 text-sm text-white/68 xl:col-span-2">
          <span>Search</span>
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Action, entity, or target..."
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
          />
        </label>

        <SelectField
          label="Scope"
          name="scope"
          value={filters.scope}
          options={[{ value: 'all', label: 'All scopes' }, ...options.scopes]}
        />

        <SelectField
          label="Actor"
          name="actorUserId"
          value={filters.actorUserId}
          options={[{ value: 'all', label: 'All actors' }, ...options.actors]}
        />

        <SelectField
          label="Branch"
          name="locationId"
          value={filters.locationId}
          options={[{ value: 'all', label: 'All branches' }, ...options.locations]}
        />

        <SelectField
          label="Entity"
          name="entityType"
          value={filters.entityType}
          options={[{ value: 'all', label: 'All entities' }, ...options.entityTypes]}
        />

        <div className="flex items-end gap-3 xl:col-span-5">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
          >
            Apply filters
          </button>
          <a
            href="/admin/activity"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
          >
            Reset
          </a>
        </div>
      </form>
    </section>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="space-y-2 text-sm text-white/68">
      <span>{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
