begin;

create or replace function public.is_privileged_member_of_org(target_org_id uuid)
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
      and om.is_active = true
      and om.role in ('owner', 'admin', 'manager')
  );
$$;

create table if not exists public.record_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  parent_comment_id uuid null,
  author_user_id uuid not null references public.profiles(id) on delete restrict,
  kind text not null default 'comment',
  body text not null,
  body_text text not null,
  is_edited boolean not null default false,
  edited_at timestamptz null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint record_comments_entity_type_check
    check (entity_type in ('job', 'incident', 'task')),
  constraint record_comments_kind_check
    check (kind in ('comment', 'internal_note', 'system')),
  constraint record_comments_parent_comment_id_fkey
    foreign key (parent_comment_id) references public.record_comments(id) on delete cascade
);

create table if not exists public.record_comment_mentions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  comment_id uuid not null references public.record_comments(id) on delete cascade,
  mentioned_user_id uuid not null references public.profiles(id) on delete cascade,
  mentioned_by_user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint record_comment_mentions_entity_type_check
    check (entity_type in ('job', 'incident', 'task')),
  constraint record_comment_mentions_unique
    unique (comment_id, mentioned_user_id)
);

create table if not exists public.record_watchers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null default 'manual',
  is_muted boolean not null default false,
  muted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint record_watchers_entity_type_check
    check (entity_type in ('job', 'incident', 'task')),
  constraint record_watchers_source_check
    check (source in ('manual', 'creator', 'assignee', 'participant', 'system')),
  constraint record_watchers_unique
    unique (organization_id, entity_type, entity_id, user_id)
);

create index if not exists idx_record_comments_entity
  on public.record_comments (organization_id, entity_type, entity_id, created_at asc);

create index if not exists idx_record_comments_parent
  on public.record_comments (parent_comment_id, created_at asc);

create index if not exists idx_record_comment_mentions_comment
  on public.record_comment_mentions (comment_id, created_at asc);

create index if not exists idx_record_comment_mentions_user
  on public.record_comment_mentions (mentioned_user_id, created_at desc);

create index if not exists idx_record_watchers_entity
  on public.record_watchers (organization_id, entity_type, entity_id, created_at asc);

create index if not exists idx_record_watchers_user
  on public.record_watchers (organization_id, user_id, created_at desc);

drop trigger if exists set_record_comments_updated_at on public.record_comments;
create trigger set_record_comments_updated_at
before update on public.record_comments
for each row
execute function public.set_updated_at();

drop trigger if exists set_record_watchers_updated_at on public.record_watchers;
create trigger set_record_watchers_updated_at
before update on public.record_watchers
for each row
execute function public.set_updated_at();

alter table public.record_comments enable row level security;
alter table public.record_comment_mentions enable row level security;
alter table public.record_watchers enable row level security;

create policy "record_comments_select_comment_rows"
on public.record_comments
for select
to authenticated
using (
  public.is_member_of_org(organization_id)
  and kind in ('comment', 'system')
);

create policy "record_comments_select_internal_notes"
on public.record_comments
for select
to authenticated
using (
  public.is_privileged_member_of_org(organization_id)
  and kind = 'internal_note'
);

create policy "record_comments_insert_member"
on public.record_comments
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and public.can_user_access_location(organization_id, location_id, auth.uid())
  and auth.uid() = author_user_id
  and (
    kind in ('comment', 'system')
    or public.is_privileged_member_of_org(organization_id)
  )
);

create policy "record_comments_update_author"
on public.record_comments
for update
to authenticated
using (
  public.is_member_of_org(organization_id)
  and (
    auth.uid() = author_user_id
    or public.is_privileged_member_of_org(organization_id)
  )
)
with check (
  public.is_member_of_org(organization_id)
  and (
    auth.uid() = author_user_id
    or public.is_privileged_member_of_org(organization_id)
  )
  and (
    kind in ('comment', 'system')
    or public.is_privileged_member_of_org(organization_id)
  )
);

create policy "record_comment_mentions_select_member"
on public.record_comment_mentions
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "record_comment_mentions_insert_member"
on public.record_comment_mentions
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and public.can_user_access_location(organization_id, location_id, auth.uid())
  and auth.uid() = mentioned_by_user_id
);

create policy "record_watchers_select_member"
on public.record_watchers
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "record_watchers_insert_self_or_privileged"
on public.record_watchers
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and public.can_user_access_location(organization_id, location_id, user_id)
  and (
    auth.uid() = user_id
    or public.is_privileged_member_of_org(organization_id)
  )
);

create policy "record_watchers_update_self_or_privileged"
on public.record_watchers
for update
to authenticated
using (
  public.is_member_of_org(organization_id)
  and (
    auth.uid() = user_id
    or public.is_privileged_member_of_org(organization_id)
  )
)
with check (
  public.is_member_of_org(organization_id)
  and public.can_user_access_location(organization_id, location_id, user_id)
  and (
    auth.uid() = user_id
    or public.is_privileged_member_of_org(organization_id)
  )
);

create policy "record_watchers_delete_self_or_privileged"
on public.record_watchers
for delete
to authenticated
using (
  public.is_member_of_org(organization_id)
  and (
    auth.uid() = user_id
    or public.is_privileged_member_of_org(organization_id)
  )
);

commit;
