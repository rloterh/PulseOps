begin;

create or replace function public.is_member_user_of_org(
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
    where om.organization_id = target_org_id
      and om.user_id = target_user_id
  );
$$;

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
    or public.is_member_user_of_org(organization_id, assignee_user_id)
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
    or public.is_member_user_of_org(organization_id, assignee_user_id)
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
    or public.is_member_user_of_org(organization_id, assignee_user_id)
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
    or public.is_member_user_of_org(organization_id, assignee_user_id)
  )
);

commit;
