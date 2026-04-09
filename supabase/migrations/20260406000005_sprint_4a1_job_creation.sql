begin;

alter table public.profiles
  add column if not exists is_active boolean not null default true;

alter table public.organization_members
  add column if not exists is_active boolean not null default true;

create table if not exists public.location_member_access (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, location_id, user_id)
);

create index if not exists location_member_access_org_user_idx
  on public.location_member_access (organization_id, user_id);

create index if not exists location_member_access_location_user_idx
  on public.location_member_access (location_id, user_id);

create table if not exists public.organization_reference_counters (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  scope text not null,
  last_value integer not null default 0,
  primary key (organization_id, scope),
  constraint organization_reference_counters_scope_check
    check (scope in ('job'))
);

insert into public.location_member_access (organization_id, location_id, user_id)
select
  om.organization_id,
  l.id,
  om.user_id
from public.organization_members om
join public.locations l
  on l.organization_id = om.organization_id
where om.is_active = true
  and l.is_active = true
on conflict (organization_id, location_id, user_id) do nothing;

create or replace function public.grant_location_access_for_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_active is false then
    return new;
  end if;

  insert into public.location_member_access (
    organization_id,
    location_id,
    user_id,
    is_active
  )
  select
    new.organization_id,
    l.id,
    new.user_id,
    true
  from public.locations l
  where l.organization_id = new.organization_id
    and l.is_active = true
  on conflict (organization_id, location_id, user_id) do update
  set is_active = excluded.is_active;

  return new;
end;
$$;

create or replace function public.grant_location_access_for_location()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_active is false then
    return new;
  end if;

  insert into public.location_member_access (
    organization_id,
    location_id,
    user_id,
    is_active
  )
  select
    new.organization_id,
    new.id,
    om.user_id,
    true
  from public.organization_members om
  where om.organization_id = new.organization_id
    and om.is_active = true
  on conflict (organization_id, location_id, user_id) do update
  set is_active = excluded.is_active;

  return new;
end;
$$;

drop trigger if exists on_organization_member_created_grant_location_access
  on public.organization_members;

create trigger on_organization_member_created_grant_location_access
after insert on public.organization_members
for each row
execute function public.grant_location_access_for_member();

drop trigger if exists on_location_created_grant_member_access on public.locations;

create trigger on_location_created_grant_member_access
after insert on public.locations
for each row
execute function public.grant_location_access_for_location();

create or replace function public.is_active_member_user_of_org(
  target_org_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    join public.profiles p
      on p.id = om.user_id
    where om.organization_id = target_org_id
      and om.user_id = target_user_id
      and om.is_active = true
      and coalesce(p.is_active, true) = true
  );
$$;

create or replace function public.can_user_access_location(
  target_org_id uuid,
  target_location_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.location_member_access lma
    join public.locations l
      on l.id = lma.location_id
    where lma.organization_id = target_org_id
      and lma.location_id = target_location_id
      and lma.user_id = target_user_id
      and lma.is_active = true
      and l.is_active = true
      and public.is_active_member_user_of_org(target_org_id, target_user_id)
  );
$$;

create or replace function public.can_view_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() = target_user_id
    or exists (
      select 1
      from public.organization_members viewer
      join public.organization_members subject
        on subject.organization_id = viewer.organization_id
      where viewer.user_id = auth.uid()
        and viewer.is_active = true
        and subject.user_id = target_user_id
        and subject.is_active = true
    );
$$;

create or replace function public.search_assignable_directory(
  p_org_id uuid,
  p_location_id uuid default null,
  p_query text default '',
  p_limit integer default 12
)
returns table (
  user_id uuid,
  full_name text,
  email text,
  avatar_url text,
  org_role public.organization_role,
  is_current_user boolean,
  location_id uuid,
  location_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.full_name,
    p.email,
    p.avatar_url,
    om.role as org_role,
    p.id = auth.uid() as is_current_user,
    l.id as location_id,
    l.name as location_name
  from public.organization_members om
  join public.profiles p
    on p.id = om.user_id
  join public.location_member_access lma
    on lma.organization_id = om.organization_id
   and lma.user_id = om.user_id
   and lma.is_active = true
  join public.locations l
    on l.id = lma.location_id
   and l.is_active = true
  where public.is_member_of_org(p_org_id)
    and om.organization_id = p_org_id
    and om.is_active = true
    and coalesce(p.is_active, true) = true
    and (
      p_location_id is null
      or l.id = p_location_id
    )
    and (
      coalesce(trim(p_query), '') = ''
      or coalesce(p.full_name, '') ilike '%' || trim(p_query) || '%'
      or coalesce(p.email, '') ilike '%' || trim(p_query) || '%'
      or om.role::text ilike '%' || trim(p_query) || '%'
    )
  order by
    (p.id = auth.uid()) desc,
    coalesce(p.full_name, p.email, 'zzzz') asc
  limit greatest(1, least(coalesce(p_limit, 12), 25));
$$;

create or replace function public.next_job_reference(target_org_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_value integer;
begin
  if not public.is_member_of_org(target_org_id) then
    raise exception 'Not authorized to generate job references.';
  end if;

  insert into public.organization_reference_counters (
    organization_id,
    scope,
    last_value
  )
  select
    target_org_id,
    'job',
    coalesce(
      max(
        case
          when j.reference ~ '^JOB-[0-9]+$'
            then substring(j.reference from 'JOB-([0-9]+)$')::integer
          else null
        end
      ),
      2000
    )
  from public.jobs j
  where j.organization_id = target_org_id
  on conflict (organization_id, scope) do nothing;

  update public.organization_reference_counters
  set last_value = last_value + 1
  where organization_id = target_org_id
    and scope = 'job'
  returning last_value into next_value;

  return 'JOB-' || lpad(next_value::text, 4, '0');
end;
$$;

drop policy if exists "profiles_select_same_organization" on public.profiles;

create policy "profiles_select_same_organization"
on public.profiles
for select
to authenticated
using (public.can_view_profile(id));

alter table public.location_member_access enable row level security;

drop policy if exists "location_member_access_select_member" on public.location_member_access;

create policy "location_member_access_select_member"
on public.location_member_access
for select
to authenticated
using (public.is_member_of_org(organization_id));

drop policy if exists "incidents_insert_member" on public.incidents;
drop policy if exists "incidents_update_member" on public.incidents;
drop policy if exists "jobs_insert_member" on public.jobs;
drop policy if exists "jobs_update_member" on public.jobs;

create policy "incidents_insert_member"
on public.incidents
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = owner_user_id
  and (
    assignee_user_id is null
    or public.can_user_access_location(organization_id, location_id, assignee_user_id)
  )
);

create policy "incidents_update_member"
on public.incidents
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

create policy "jobs_insert_member"
on public.jobs
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

create policy "jobs_update_member"
on public.jobs
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

commit;
