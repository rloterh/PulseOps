begin;

create type public.sla_entity_type as enum (
  'incident',
  'job',
  'task'
);

create type public.sla_status_category as enum (
  'active',
  'paused',
  'terminal'
);

create type public.sla_risk_level as enum (
  'normal',
  'at_risk',
  'breached'
);

create type public.sla_escalation_state as enum (
  'none',
  'warning',
  'escalated'
);

create table public.sla_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  entity_type public.sla_entity_type,
  priority public.job_priority,
  severity public.incident_severity,
  first_response_target_minutes integer,
  resolution_target_minutes integer,
  warn_before_breach_minutes integer not null default 30,
  escalate_on_first_response_breach boolean not null default true,
  escalate_on_resolution_breach boolean not null default true,
  escalation_role public.organization_role,
  escalation_user_id uuid references public.profiles(id) on delete set null,
  precedence integer not null default 100,
  created_by_user_id uuid references public.profiles(id) on delete set null,
  updated_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sla_policies_name_length_check
    check (char_length(trim(name)) between 2 and 80),
  constraint sla_policies_has_target_check
    check (
      first_response_target_minutes is not null
      or resolution_target_minutes is not null
    ),
  constraint sla_policies_first_response_positive_check
    check (
      first_response_target_minutes is null
      or first_response_target_minutes > 0
    ),
  constraint sla_policies_resolution_positive_check
    check (
      resolution_target_minutes is null
      or resolution_target_minutes > 0
    ),
  constraint sla_policies_warn_before_breach_nonnegative_check
    check (warn_before_breach_minutes >= 0),
  constraint sla_policies_precedence_positive_check
    check (precedence > 0)
);

create table public.work_item_slas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  entity_type public.sla_entity_type not null,
  entity_id uuid not null,
  policy_id uuid references public.sla_policies(id) on delete set null,
  status_category public.sla_status_category not null default 'active',
  first_response_target_minutes integer,
  resolution_target_minutes integer,
  first_response_due_at timestamptz,
  resolution_due_at timestamptz,
  first_responded_at timestamptz,
  resolved_at timestamptz,
  first_response_breached_at timestamptz,
  resolution_breached_at timestamptz,
  paused_at timestamptz,
  paused_reason text,
  total_paused_seconds integer not null default 0,
  escalation_state public.sla_escalation_state not null default 'none',
  risk_level public.sla_risk_level not null default 'normal',
  warning_sent_at timestamptz,
  escalation_triggered_at timestamptz,
  last_evaluated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_item_slas_entity_unique
    unique (organization_id, entity_type, entity_id),
  constraint work_item_slas_entity_type_id_unique
    unique (entity_type, entity_id),
  constraint work_item_slas_first_response_positive_check
    check (
      first_response_target_minutes is null
      or first_response_target_minutes > 0
    ),
  constraint work_item_slas_resolution_positive_check
    check (
      resolution_target_minutes is null
      or resolution_target_minutes > 0
    ),
  constraint work_item_slas_total_paused_seconds_nonnegative_check
    check (total_paused_seconds >= 0)
);

alter table public.incidents
  add column if not exists first_response_at timestamptz,
  add column if not exists resolved_at timestamptz;

alter table public.jobs
  add column if not exists first_response_at timestamptz,
  add column if not exists resolved_at timestamptz;

alter table public.tasks
  add column if not exists first_response_at timestamptz,
  add column if not exists resolved_at timestamptz;

create index sla_policies_org_precedence_idx
  on public.sla_policies (organization_id, is_active, precedence asc);

create index sla_policies_location_entity_idx
  on public.sla_policies (
    organization_id,
    location_id,
    entity_type,
    priority,
    severity
  );

create index work_item_slas_org_risk_idx
  on public.work_item_slas (
    organization_id,
    risk_level,
    escalation_state,
    resolution_due_at asc
  );

create index work_item_slas_org_location_idx
  on public.work_item_slas (
    organization_id,
    location_id,
    entity_type,
    created_at desc
  );

drop trigger if exists set_sla_policies_updated_at on public.sla_policies;
create trigger set_sla_policies_updated_at
before update on public.sla_policies
for each row
execute function public.set_updated_at();

drop trigger if exists set_work_item_slas_updated_at on public.work_item_slas;
create trigger set_work_item_slas_updated_at
before update on public.work_item_slas
for each row
execute function public.set_updated_at();

alter table public.sla_policies enable row level security;
alter table public.work_item_slas enable row level security;

create policy "sla_policies_select_member"
on public.sla_policies
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "sla_policies_insert_privileged"
on public.sla_policies
for insert
to authenticated
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'manager']::public.organization_role[]
  )
);

create policy "sla_policies_update_privileged"
on public.sla_policies
for update
to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'manager']::public.organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'manager']::public.organization_role[]
  )
);

create policy "sla_policies_delete_privileged"
on public.sla_policies
for delete
to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'manager']::public.organization_role[]
  )
);

create policy "work_item_slas_select_member"
on public.work_item_slas
for select
to authenticated
using (public.is_member_of_org(organization_id));

create or replace function public.resolve_sla_status_category(
  p_entity_type public.sla_entity_type,
  p_status text
)
returns public.sla_status_category
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_status in ('resolved', 'closed', 'completed', 'cancelled') then
    return 'terminal';
  end if;

  if p_status in ('waiting_on_customer', 'waiting_on_third_party', 'on_hold') then
    return 'paused';
  end if;

  return 'active';
end;
$$;

create or replace function public.resolve_sla_policy(
  p_organization_id uuid,
  p_location_id uuid,
  p_entity_type public.sla_entity_type,
  p_priority public.job_priority default null,
  p_severity public.incident_severity default null
)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  with candidate_policies as (
    select
      sp.id,
      sp.precedence,
      (
        case when sp.location_id is not null then 1 else 0 end +
        case when sp.entity_type is not null then 1 else 0 end +
        case when sp.priority is not null then 1 else 0 end +
        case when sp.severity is not null then 1 else 0 end
      ) as specificity
    from public.sla_policies sp
    where sp.organization_id = p_organization_id
      and sp.is_active = true
      and (sp.location_id is null or sp.location_id = p_location_id)
      and (sp.entity_type is null or sp.entity_type = p_entity_type)
      and (sp.priority is null or sp.priority = p_priority)
      and (sp.severity is null or sp.severity = p_severity)
  )
  select id
  from candidate_policies
  order by specificity desc, precedence asc, id asc
  limit 1;
$$;

create or replace function public.upsert_work_item_sla_snapshot(
  p_organization_id uuid,
  p_location_id uuid,
  p_entity_type public.sla_entity_type,
  p_entity_id uuid,
  p_status text,
  p_opened_at timestamptz,
  p_first_response_at timestamptz default null,
  p_resolved_at timestamptz default null,
  p_priority public.job_priority default null,
  p_severity public.incident_severity default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_policy_id uuid;
  v_first_response_target_minutes integer;
  v_resolution_target_minutes integer;
  v_status_category public.sla_status_category;
  v_first_response_due_at timestamptz;
  v_resolution_due_at timestamptz;
  v_snapshot_id uuid;
begin
  v_policy_id := public.resolve_sla_policy(
    p_organization_id,
    p_location_id,
    p_entity_type,
    p_priority,
    p_severity
  );

  if v_policy_id is not null then
    select
      sp.first_response_target_minutes,
      sp.resolution_target_minutes
    into
      v_first_response_target_minutes,
      v_resolution_target_minutes
    from public.sla_policies sp
    where sp.id = v_policy_id;
  end if;

  v_status_category := public.resolve_sla_status_category(p_entity_type, p_status);

  v_first_response_due_at := case
    when v_first_response_target_minutes is not null
      then p_opened_at + make_interval(mins => v_first_response_target_minutes)
    else null
  end;

  v_resolution_due_at := case
    when v_resolution_target_minutes is not null
      then p_opened_at + make_interval(mins => v_resolution_target_minutes)
    else null
  end;

  insert into public.work_item_slas (
    organization_id,
    location_id,
    entity_type,
    entity_id,
    policy_id,
    status_category,
    first_response_target_minutes,
    resolution_target_minutes,
    first_response_due_at,
    resolution_due_at,
    first_responded_at,
    resolved_at,
    paused_at,
    total_paused_seconds,
    escalation_state,
    risk_level,
    last_evaluated_at
  )
  values (
    p_organization_id,
    p_location_id,
    p_entity_type,
    p_entity_id,
    v_policy_id,
    v_status_category,
    v_first_response_target_minutes,
    v_resolution_target_minutes,
    v_first_response_due_at,
    v_resolution_due_at,
    p_first_response_at,
    p_resolved_at,
    null,
    0,
    'none',
    'normal',
    null
  )
  on conflict (entity_type, entity_id)
  do update set
    organization_id = excluded.organization_id,
    location_id = excluded.location_id,
    policy_id = excluded.policy_id,
    status_category = excluded.status_category,
    first_response_target_minutes = excluded.first_response_target_minutes,
    resolution_target_minutes = excluded.resolution_target_minutes,
    first_response_due_at = excluded.first_response_due_at,
    resolution_due_at = excluded.resolution_due_at,
    first_responded_at = excluded.first_responded_at,
    resolved_at = excluded.resolved_at,
    updated_at = now()
  returning id into v_snapshot_id;

  return v_snapshot_id;
end;
$$;

commit;
