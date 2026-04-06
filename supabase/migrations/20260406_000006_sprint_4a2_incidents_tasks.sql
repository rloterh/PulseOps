begin;

alter table public.organization_reference_counters
  drop constraint if exists organization_reference_counters_scope_check;

alter table public.organization_reference_counters
  add constraint organization_reference_counters_scope_check
  check (scope in ('job', 'incident', 'task'));

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'task_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.task_status as enum (
      'todo',
      'in_progress',
      'blocked',
      'completed',
      'cancelled'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'task_timeline_event_type'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.task_timeline_event_type as enum (
      'created',
      'assignment',
      'status_change',
      'note',
      'completed'
    );
  end if;
end
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  linked_incident_id uuid references public.incidents(id) on delete set null,
  linked_job_id uuid references public.jobs(id) on delete set null,
  reference text not null,
  title text not null,
  summary text not null,
  priority public.job_priority not null default 'medium',
  status public.task_status not null default 'todo',
  due_at timestamptz,
  created_by_user_id uuid not null references public.profiles(id) on delete restrict,
  assignee_user_id uuid references public.profiles(id) on delete set null,
  completion_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_reference_unique unique (organization_id, reference),
  constraint tasks_single_link_check
    check (num_nonnulls(linked_incident_id, linked_job_id) <= 1)
);

create table if not exists public.task_timeline_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  event_type public.task_timeline_event_type not null,
  title text not null,
  description text not null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_name text not null default 'System',
  created_at timestamptz not null default now()
);

create index if not exists tasks_organization_location_idx
  on public.tasks (organization_id, location_id);

create index if not exists tasks_status_idx
  on public.tasks (organization_id, status, priority, due_at);

create index if not exists tasks_assignee_idx
  on public.tasks (assignee_user_id);

create index if not exists tasks_linked_incident_idx
  on public.tasks (linked_incident_id);

create index if not exists tasks_linked_job_idx
  on public.tasks (linked_job_id);

create index if not exists task_timeline_events_task_idx
  on public.task_timeline_events (task_id, created_at desc);

drop trigger if exists set_tasks_updated_at on public.tasks;

create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.task_timeline_events enable row level security;

drop policy if exists "tasks_select_member" on public.tasks;
drop policy if exists "tasks_insert_member" on public.tasks;
drop policy if exists "tasks_update_member" on public.tasks;
drop policy if exists "task_timeline_events_select_member" on public.task_timeline_events;
drop policy if exists "task_timeline_events_insert_member" on public.task_timeline_events;

create policy "tasks_select_member"
on public.tasks
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "tasks_insert_member"
on public.tasks
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = created_by_user_id
  and (
    assignee_user_id is null
    or public.can_user_access_location(organization_id, location_id, assignee_user_id)
  )
);

create policy "tasks_update_member"
on public.tasks
for update
to authenticated
using (public.is_member_of_org(organization_id))
with check (
  public.is_member_of_org(organization_id)
  and (
    assignee_user_id is null
    or public.can_user_access_location(organization_id, location_id, assignee_user_id)
  )
);

create policy "task_timeline_events_select_member"
on public.task_timeline_events
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "task_timeline_events_insert_member"
on public.task_timeline_events
for insert
to authenticated
with check (public.is_member_of_org(organization_id));

create or replace function public.next_incident_reference(target_org_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_value integer;
begin
  if not public.is_member_of_org(target_org_id) then
    raise exception 'Not authorized to generate incident references.';
  end if;

  insert into public.organization_reference_counters (
    organization_id,
    scope,
    last_value
  )
  select
    target_org_id,
    'incident',
    coalesce(
      max(
        case
          when i.reference ~ '^INC-[0-9]+$'
            then substring(i.reference from 'INC-([0-9]+)$')::integer
          else null
        end
      ),
      1000
    )
  from public.incidents i
  where i.organization_id = target_org_id
  on conflict (organization_id, scope) do nothing;

  update public.organization_reference_counters
  set last_value = last_value + 1
  where organization_id = target_org_id
    and scope = 'incident'
  returning last_value into next_value;

  return 'INC-' || lpad(next_value::text, 4, '0');
end;
$$;

create or replace function public.next_task_reference(target_org_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_value integer;
begin
  if not public.is_member_of_org(target_org_id) then
    raise exception 'Not authorized to generate task references.';
  end if;

  insert into public.organization_reference_counters (
    organization_id,
    scope,
    last_value
  )
  select
    target_org_id,
    'task',
    coalesce(
      max(
        case
          when t.reference ~ '^TASK-[0-9]+$'
            then substring(t.reference from 'TASK-([0-9]+)$')::integer
          else null
        end
      ),
      3000
    )
  from public.tasks t
  where t.organization_id = target_org_id
  on conflict (organization_id, scope) do nothing;

  update public.organization_reference_counters
  set last_value = last_value + 1
  where organization_id = target_org_id
    and scope = 'task'
  returning last_value into next_value;

  return 'TASK-' || lpad(next_value::text, 4, '0');
end;
$$;

commit;
