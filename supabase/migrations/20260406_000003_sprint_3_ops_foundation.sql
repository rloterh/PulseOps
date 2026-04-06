begin;

create type public.incident_severity as enum (
  'critical',
  'high',
  'medium',
  'low'
);

create type public.incident_status as enum (
  'open',
  'investigating',
  'monitoring',
  'resolved',
  'closed'
);

create type public.job_priority as enum (
  'urgent',
  'high',
  'medium',
  'low'
);

create type public.job_status as enum (
  'new',
  'scheduled',
  'in_progress',
  'blocked',
  'completed',
  'cancelled'
);

create type public.job_type as enum (
  'reactive',
  'preventive',
  'inspection',
  'vendor'
);

create type public.incident_timeline_event_type as enum (
  'created',
  'assignment',
  'status_change',
  'note',
  'resolution'
);

create type public.job_timeline_event_type as enum (
  'created',
  'scheduled',
  'assignment',
  'status_change',
  'note',
  'completed'
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  reference text not null,
  title text not null,
  summary text not null,
  site_name text not null,
  customer_name text not null,
  severity public.incident_severity not null default 'medium',
  status public.incident_status not null default 'open',
  sla_risk boolean not null default false,
  opened_at timestamptz not null default now(),
  owner_user_id uuid not null references public.profiles(id) on delete restrict,
  assignee_user_id uuid references public.profiles(id) on delete set null,
  impact_summary text not null default '',
  next_action text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint incidents_reference_unique unique (organization_id, reference)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete set null,
  reference text not null,
  title text not null,
  summary text not null,
  site_name text not null,
  customer_name text not null,
  priority public.job_priority not null default 'medium',
  status public.job_status not null default 'new',
  type public.job_type not null default 'reactive',
  due_at timestamptz,
  created_by_user_id uuid not null references public.profiles(id) on delete restrict,
  assignee_user_id uuid references public.profiles(id) on delete set null,
  checklist_summary text not null default '',
  resolution_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_reference_unique unique (organization_id, reference)
);

create table public.incident_timeline_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  incident_id uuid not null references public.incidents(id) on delete cascade,
  event_type public.incident_timeline_event_type not null,
  title text not null,
  description text not null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_name text not null default 'System',
  created_at timestamptz not null default now()
);

create table public.job_timeline_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  event_type public.job_timeline_event_type not null,
  title text not null,
  description text not null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_name text not null default 'System',
  created_at timestamptz not null default now()
);

create index incidents_organization_location_idx
  on public.incidents (organization_id, location_id);

create index incidents_status_idx
  on public.incidents (organization_id, status, severity, opened_at desc);

create index incidents_owner_idx
  on public.incidents (owner_user_id);

create index incidents_assignee_idx
  on public.incidents (assignee_user_id);

create index jobs_organization_location_idx
  on public.jobs (organization_id, location_id);

create index jobs_status_idx
  on public.jobs (organization_id, status, priority, due_at);

create index jobs_incident_idx
  on public.jobs (incident_id);

create index jobs_assignee_idx
  on public.jobs (assignee_user_id);

create index incident_timeline_events_incident_idx
  on public.incident_timeline_events (incident_id, created_at desc);

create index job_timeline_events_job_idx
  on public.job_timeline_events (job_id, created_at desc);

create trigger set_incidents_updated_at
before update on public.incidents
for each row
execute function public.set_updated_at();

create trigger set_jobs_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

alter table public.incidents enable row level security;
alter table public.jobs enable row level security;
alter table public.incident_timeline_events enable row level security;
alter table public.job_timeline_events enable row level security;

create policy "incidents_select_member"
on public.incidents
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "incidents_insert_member"
on public.incidents
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = owner_user_id
);

create policy "incidents_update_member"
on public.incidents
for update
to authenticated
using (public.is_member_of_org(organization_id))
with check (public.is_member_of_org(organization_id));

create policy "jobs_select_member"
on public.jobs
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "jobs_insert_member"
on public.jobs
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = created_by_user_id
);

create policy "jobs_update_member"
on public.jobs
for update
to authenticated
using (public.is_member_of_org(organization_id))
with check (public.is_member_of_org(organization_id));

create policy "incident_timeline_events_select_member"
on public.incident_timeline_events
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "incident_timeline_events_insert_member"
on public.incident_timeline_events
for insert
to authenticated
with check (public.is_member_of_org(organization_id));

create policy "job_timeline_events_select_member"
on public.job_timeline_events
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "job_timeline_events_insert_member"
on public.job_timeline_events
for insert
to authenticated
with check (public.is_member_of_org(organization_id));

commit;
