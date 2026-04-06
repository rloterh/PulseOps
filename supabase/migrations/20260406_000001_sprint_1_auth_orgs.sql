begin;

create extension if not exists pgcrypto;

create type public.organization_role as enum (
  'owner',
  'admin',
  'manager',
  'agent'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.organization_role not null default 'agent',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text,
  timezone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index organization_members_user_id_idx
  on public.organization_members (user_id);

create index organization_members_organization_id_idx
  on public.organization_members (organization_id);

create index organization_members_organization_role_idx
  on public.organization_members (organization_id, role);

create index locations_organization_id_idx
  on public.locations (organization_id);

create index organizations_created_by_idx
  on public.organizations (created_by);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_organizations_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(coalesce(new.raw_user_meta_data ->> 'full_name', ''), ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'avatar_url', ''), '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_member_of_org(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org_id
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(
  target_org_id uuid,
  allowed_roles public.organization_role[]
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
    where om.organization_id = target_org_id
      and om.user_id = auth.uid()
      and om.role = any(allowed_roles)
  );
$$;

create or replace function public.can_bootstrap_org_membership(
  target_org_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = target_user_id
    and exists (
      select 1
      from public.organizations o
      where o.id = target_org_id
        and o.created_by = auth.uid()
    )
    and not exists (
      select 1
      from public.organization_members om
      where om.organization_id = target_org_id
    );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.locations enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "organizations_select_member"
on public.organizations
for select
to authenticated
using (public.is_member_of_org(id));

create policy "organizations_insert_authenticated"
on public.organizations
for insert
to authenticated
with check (auth.uid() = created_by);

create policy "organizations_update_owner_admin"
on public.organizations
for update
to authenticated
using (
  public.has_org_role(
    id,
    array['owner', 'admin']::public.organization_role[]
  )
)
with check (
  public.has_org_role(
    id,
    array['owner', 'admin']::public.organization_role[]
  )
);

create policy "organization_members_select_member"
on public.organization_members
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "organization_members_insert_bootstrap_or_owner_admin"
on public.organization_members
for insert
to authenticated
with check (
  public.can_bootstrap_org_membership(organization_id, user_id)
  or public.has_org_role(
    organization_id,
    array['owner', 'admin']::public.organization_role[]
  )
);

create policy "organization_members_update_owner_admin"
on public.organization_members
for update
to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin']::public.organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin']::public.organization_role[]
  )
);

create policy "locations_select_member"
on public.locations
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "locations_insert_owner_admin_manager"
on public.locations
for insert
to authenticated
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'manager']::public.organization_role[]
  )
);

create policy "locations_update_owner_admin_manager"
on public.locations
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

commit;
