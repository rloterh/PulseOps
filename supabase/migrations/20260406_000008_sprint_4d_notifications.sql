create table if not exists public.record_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  event_type text not null,
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  href text not null,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint record_notifications_entity_type_check
    check (entity_type in ('incident', 'job', 'task')),
  constraint record_notifications_event_type_check
    check (event_type in ('comment', 'mention', 'assignment', 'status_change', 'record_created'))
);

create index if not exists idx_record_notifications_recipient_feed
  on public.record_notifications (
    organization_id,
    recipient_user_id,
    archived_at,
    read_at,
    created_at desc
  );

create index if not exists idx_record_notifications_record_lookup
  on public.record_notifications (organization_id, entity_type, entity_id, created_at desc);

drop trigger if exists set_record_notifications_updated_at on public.record_notifications;
create trigger set_record_notifications_updated_at
before update on public.record_notifications
for each row
execute function public.set_updated_at();

alter table public.record_notifications enable row level security;

create policy "record_notifications_select_recipient"
on public.record_notifications
for select
to authenticated
using (
  public.is_member_of_org(organization_id)
  and auth.uid() = recipient_user_id
);

create policy "record_notifications_update_recipient"
on public.record_notifications
for update
to authenticated
using (
  public.is_member_of_org(organization_id)
  and auth.uid() = recipient_user_id
)
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = recipient_user_id
);
