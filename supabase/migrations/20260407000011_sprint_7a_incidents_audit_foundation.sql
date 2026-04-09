begin;

create type public.escalation_status as enum (
  'pending',
  'sent',
  'acknowledged',
  'completed',
  'cancelled'
);

create type public.audit_actor_type as enum (
  'user',
  'system',
  'service'
);

alter table public.incidents
  add column if not exists acknowledged_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists escalation_level integer not null default 0,
  add column if not exists last_activity_at timestamptz not null default now();

create table if not exists public.incident_escalations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  incident_id uuid not null references public.incidents(id) on delete cascade,
  triggered_by_user_id uuid references public.profiles(id) on delete set null,
  escalation_level integer not null,
  reason text,
  target_user_id uuid references public.profiles(id) on delete set null,
  target_role public.organization_role,
  target_queue text,
  status public.escalation_status not null default 'pending',
  acknowledged_by_user_id uuid references public.profiles(id) on delete set null,
  triggered_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint incident_escalations_level_positive_check
    check (escalation_level > 0),
  constraint incident_escalations_has_target_check
    check (
      target_user_id is not null
      or target_role is not null
      or nullif(trim(coalesce(target_queue, '')), '') is not null
    )
);

create index if not exists incident_escalations_incident_idx
  on public.incident_escalations (incident_id, triggered_at desc);

create index if not exists incident_escalations_org_status_idx
  on public.incident_escalations (organization_id, status, triggered_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  actor_type public.audit_actor_type not null default 'user',
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_label text,
  scope text,
  request_id text,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_org_created_idx
  on public.audit_logs (organization_id, created_at desc);

create index if not exists audit_logs_org_actor_idx
  on public.audit_logs (organization_id, actor_user_id, created_at desc);

create index if not exists audit_logs_org_entity_idx
  on public.audit_logs (organization_id, entity_type, entity_id, created_at desc);

drop trigger if exists set_incident_escalations_updated_at on public.incident_escalations;
create trigger set_incident_escalations_updated_at
before update on public.incident_escalations
for each row
execute function public.set_updated_at();

create or replace function public.set_incidents_last_activity_at()
returns trigger
language plpgsql
as $$
begin
  new.last_activity_at = now();
  return new;
end;
$$;

drop trigger if exists set_incidents_last_activity_at on public.incidents;
create trigger set_incidents_last_activity_at
before update on public.incidents
for each row
execute function public.set_incidents_last_activity_at();

alter table public.incident_escalations enable row level security;
alter table public.audit_logs enable row level security;

create policy "incident_escalations_select_member"
on public.incident_escalations
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "incident_escalations_insert_member"
on public.incident_escalations
for insert
to authenticated
with check (public.is_member_of_org(organization_id));

create policy "incident_escalations_update_member"
on public.incident_escalations
for update
to authenticated
using (public.is_member_of_org(organization_id))
with check (public.is_member_of_org(organization_id));

create policy "audit_logs_select_privileged"
on public.audit_logs
for select
to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'manager']::public.organization_role[]
  )
);

create policy "audit_logs_insert_member"
on public.audit_logs
for insert
to authenticated
with check (public.is_member_of_org(organization_id));

create policy "audit_logs_update_none"
on public.audit_logs
for update
to authenticated
using (false)
with check (false);

create policy "audit_logs_delete_none"
on public.audit_logs
for delete
to authenticated
using (false);

commit;
