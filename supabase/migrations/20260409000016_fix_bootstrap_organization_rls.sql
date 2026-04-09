begin;

create or replace function public.bootstrap_organization(
  org_name text,
  org_slug text,
  default_location_name text default 'Head Office',
  default_location_code text default 'HQ-001',
  default_location_timezone text default 'UTC'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  resolved_org_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if exists (
    select 1
    from public.organization_members om
    where om.user_id = current_user_id
  ) then
    raise exception 'You already belong to a workspace.';
  end if;

  select o.id
  into resolved_org_id
  from public.organizations o
  where o.slug = org_slug
    and o.created_by = current_user_id
    and not exists (
      select 1
      from public.organization_members om
      where om.organization_id = o.id
    )
  order by o.created_at asc
  limit 1;

  if resolved_org_id is null then
    insert into public.organizations (
      name,
      slug,
      created_by
    )
    values (
      org_name,
      org_slug,
      current_user_id
    )
    returning id into resolved_org_id;
  end if;

  insert into public.organization_members (
    organization_id,
    user_id,
    role
  )
  values (
    resolved_org_id,
    current_user_id,
    'owner'
  )
  on conflict (organization_id, user_id) do nothing;

  insert into public.locations (
    organization_id,
    name,
    code,
    timezone
  )
  values (
    resolved_org_id,
    default_location_name,
    default_location_code,
    default_location_timezone
  )
  on conflict (organization_id, code)
  where code is not null do nothing;

  return resolved_org_id;
end;
$$;

revoke all on function public.bootstrap_organization(text, text, text, text, text) from public;
grant execute on function public.bootstrap_organization(text, text, text, text, text) to authenticated;

commit;
