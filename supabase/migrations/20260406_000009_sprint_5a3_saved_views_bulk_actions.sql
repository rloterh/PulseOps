create table if not exists public.saved_list_views (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  resource_type text not null,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_list_views_resource_type_check
    check (resource_type in ('jobs', 'incidents')),
  constraint saved_list_views_filters_object_check
    check (jsonb_typeof(filters) = 'object'),
  constraint saved_list_views_name_length_check
    check (char_length(trim(name)) between 2 and 48)
);

create unique index if not exists idx_saved_list_views_user_name
  on public.saved_list_views (organization_id, user_id, resource_type, lower(name));

create index if not exists idx_saved_list_views_user_resource
  on public.saved_list_views (organization_id, user_id, resource_type, created_at desc);

drop trigger if exists set_saved_list_views_updated_at on public.saved_list_views;
create trigger set_saved_list_views_updated_at
before update on public.saved_list_views
for each row
execute function public.set_updated_at();

alter table public.saved_list_views enable row level security;

create policy "saved_list_views_select_owner"
on public.saved_list_views
for select
to authenticated
using (
  public.is_member_of_org(organization_id)
  and auth.uid() = user_id
);

create policy "saved_list_views_insert_owner"
on public.saved_list_views
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = user_id
);

create policy "saved_list_views_update_owner"
on public.saved_list_views
for update
to authenticated
using (
  public.is_member_of_org(organization_id)
  and auth.uid() = user_id
)
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = user_id
);

create policy "saved_list_views_delete_owner"
on public.saved_list_views
for delete
to authenticated
using (
  public.is_member_of_org(organization_id)
  and auth.uid() = user_id
);
