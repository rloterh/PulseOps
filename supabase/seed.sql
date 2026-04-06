insert into public.organizations (id, name, slug, created_by)
select
  '11111111-1111-1111-1111-111111111111',
  'Demo Workspace',
  'demo-workspace',
  p.id
from public.profiles p
limit 1
on conflict (slug) do nothing;

insert into public.organization_members (organization_id, user_id, role)
select
  '11111111-1111-1111-1111-111111111111',
  p.id,
  'owner'::public.organization_role
from public.profiles p
limit 1
on conflict (organization_id, user_id) do nothing;

insert into public.locations (organization_id, name, code, timezone)
values
  ('11111111-1111-1111-1111-111111111111', 'Head Office', 'HQ-001', 'UTC'),
  ('11111111-1111-1111-1111-111111111111', 'North Hub', 'NTH-001', 'Europe/London'),
  ('11111111-1111-1111-1111-111111111111', 'West Hub', 'WST-001', 'America/New_York')
on conflict do nothing;

insert into public.incidents (
  id,
  organization_id,
  location_id,
  reference,
  title,
  summary,
  site_name,
  customer_name,
  severity,
  status,
  sla_risk,
  opened_at,
  owner_user_id,
  assignee_user_id,
  impact_summary,
  next_action
)
select
  incident_seed.id,
  '11111111-1111-1111-1111-111111111111',
  incident_seed.location_id,
  incident_seed.reference,
  incident_seed.title,
  incident_seed.summary,
  incident_seed.site_name,
  incident_seed.customer_name,
  incident_seed.severity::public.incident_severity,
  incident_seed.status::public.incident_status,
  incident_seed.sla_risk,
  incident_seed.opened_at::timestamptz,
  context.profile_id,
  context.profile_id,
  incident_seed.impact_summary,
  incident_seed.next_action
from (
  select
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid as id,
    (select id from public.locations where organization_id = '11111111-1111-1111-1111-111111111111' and code = 'NTH-001' limit 1) as location_id,
    'INC-1001' as reference,
    'HVAC outage at North Hub' as title,
    'Cooling systems on the second floor stopped responding and tenant suites are overheating.' as summary,
    'North Hub' as site_name,
    'North Hub Retail' as customer_name,
    'critical' as severity,
    'investigating' as status,
    true as sla_risk,
    '2026-04-05T08:35:00Z' as opened_at,
    'Impacts 14 occupied suites and shared circulation areas.' as impact_summary,
    'Dispatch an on-call HVAC engineer and keep tenants updated every 30 minutes.' as next_action
  union all
  select
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
    (select id from public.locations where organization_id = '11111111-1111-1111-1111-111111111111' and code = 'HQ-001' limit 1),
    'INC-1002',
    'Water leak near loading bay corridor',
    'Water ingress was reported behind the service wall next to the loading corridor.',
    'Head Office',
    'Head Office Facilities',
    'high',
    'open',
    true,
    '2026-04-05T09:10:00Z',
    'Slip risk is rising and nearby stockrooms may be affected if the source is not isolated.',
    'Isolate the supply line and inspect the wall cavity before the afternoon delivery window.'
  union all
  select
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
    (select id from public.locations where organization_id = '11111111-1111-1111-1111-111111111111' and code = 'WST-001' limit 1),
    'INC-1003',
    'Access control intermittently failing',
    'Staff badges are occasionally rejected at the west hub lobby gate during the morning rush.',
    'West Hub',
    'West Hub Management',
    'medium',
    'monitoring',
    false,
    '2026-04-04T15:20:00Z',
    'Security staff are manually admitting operators while the controller is monitored.',
    'Monitor the controller logs and keep a vendor call on standby if failure rate climbs again.'
) as incident_seed
cross join (
  select p.id as profile_id
  from public.profiles p
  order by p.created_at asc
  limit 1
) as context
where incident_seed.location_id is not null
on conflict (id) do nothing;

insert into public.jobs (
  id,
  organization_id,
  location_id,
  incident_id,
  reference,
  title,
  summary,
  site_name,
  customer_name,
  priority,
  status,
  type,
  due_at,
  created_by_user_id,
  assignee_user_id,
  checklist_summary,
  resolution_summary
)
select
  job_seed.id,
  '11111111-1111-1111-1111-111111111111',
  job_seed.location_id,
  job_seed.incident_id,
  job_seed.reference,
  job_seed.title,
  job_seed.summary,
  job_seed.site_name,
  job_seed.customer_name,
  job_seed.priority::public.job_priority,
  job_seed.status::public.job_status,
  job_seed.type::public.job_type,
  job_seed.due_at::timestamptz,
  context.profile_id,
  context.profile_id,
  job_seed.checklist_summary,
  job_seed.resolution_summary
from (
  select
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid as id,
    (select id from public.locations where organization_id = '11111111-1111-1111-1111-111111111111' and code = 'NTH-001' limit 1) as location_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid as incident_id,
    'JOB-2001' as reference,
    'Emergency HVAC diagnosis and reset' as title,
    'Investigate the live HVAC outage, restore cooling, and confirm stable operation.' as summary,
    'North Hub' as site_name,
    'North Hub Retail' as customer_name,
    'urgent' as priority,
    'in_progress' as status,
    'reactive' as type,
    '2026-04-05T13:00:00Z' as due_at,
    'Safety checks, controller diagnostics, zone testing, tenant update.' as checklist_summary,
    null::text as resolution_summary
  union all
  select
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid,
    (select id from public.locations where organization_id = '11111111-1111-1111-1111-111111111111' and code = 'HQ-001' limit 1),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
    'JOB-2002',
    'Leak isolation and plumbing inspection',
    'Inspect the service wall, isolate the source, and document any damaged materials.',
    'Head Office',
    'Head Office Facilities',
    'high',
    'scheduled',
    'reactive',
    '2026-04-05T15:30:00Z',
    'Inspect wall cavity, isolate source, photograph damage, submit estimate.',
    null::text
  union all
  select
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'::uuid,
    (select id from public.locations where organization_id = '11111111-1111-1111-1111-111111111111' and code = 'WST-001' limit 1),
    null::uuid,
    'JOB-2003',
    'Preventive cooling system inspection',
    'Complete the scheduled cooling plant inspection before the next high-demand period.',
    'West Hub',
    'West Hub Management',
    'medium',
    'scheduled',
    'preventive',
    '2026-04-06T09:00:00Z',
    'Inspect panels, verify refrigerant readings, capture follow-up notes.',
    null::text
) as job_seed
cross join (
  select p.id as profile_id
  from public.profiles p
  order by p.created_at asc
  limit 1
) as context
where job_seed.location_id is not null
on conflict (id) do nothing;

insert into public.incident_timeline_events (
  id,
  organization_id,
  incident_id,
  event_type,
  title,
  description,
  actor_user_id,
  actor_name,
  created_at
)
select
  event_seed.id,
  '11111111-1111-1111-1111-111111111111',
  event_seed.incident_id,
  event_seed.event_type::public.incident_timeline_event_type,
  event_seed.title,
  event_seed.description,
  context.profile_id,
  coalesce(context.actor_name, 'Operations Lead'),
  event_seed.created_at::timestamptz
from (
  select
    'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid as id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid as incident_id,
    'created' as event_type,
    'Incident created' as title,
    'Issue reported by the site manager and classified as critical.' as description,
    '2026-04-05T08:35:00Z' as created_at
  union all
  select
    'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
    'assignment',
    'Assigned to response lead',
    'The incident was assigned to the on-call facilities lead for immediate triage.',
    '2026-04-05T08:42:00Z'
  union all
  select
    'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
    'created',
    'Incident created',
    'Leak reported by warehouse operations and classified as high severity.',
    '2026-04-05T09:10:00Z'
) as event_seed
cross join (
  select
    p.id as profile_id,
    coalesce(p.full_name, p.email, 'Operations Lead') as actor_name
  from public.profiles p
  order by p.created_at asc
  limit 1
) as context
on conflict (id) do nothing;

insert into public.job_timeline_events (
  id,
  organization_id,
  job_id,
  event_type,
  title,
  description,
  actor_user_id,
  actor_name,
  created_at
)
select
  event_seed.id,
  '11111111-1111-1111-1111-111111111111',
  event_seed.job_id,
  event_seed.event_type::public.job_timeline_event_type,
  event_seed.title,
  event_seed.description,
  context.profile_id,
  coalesce(context.actor_name, 'Operations Lead'),
  event_seed.created_at::timestamptz
from (
  select
    'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid as id,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid as job_id,
    'created' as event_type,
    'Job created' as title,
    'Reactive job created from the HVAC outage incident.' as description,
    '2026-04-05T08:40:00Z' as created_at
  union all
  select
    'dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
    'status_change',
    'Work started' as title,
    'The assigned lead confirmed arrival on site and started diagnostics.' as description,
    '2026-04-05T09:00:00Z'
  union all
  select
    'dddddddd-dddd-dddd-dddd-ddddddddddd3'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid,
    'scheduled',
    'Visit scheduled',
    'Leak inspection was scheduled for the next available facilities slot.',
    '2026-04-05T09:35:00Z'
) as event_seed
cross join (
  select
    p.id as profile_id,
    coalesce(p.full_name, p.email, 'Operations Lead') as actor_name
  from public.profiles p
  order by p.created_at asc
  limit 1
) as context
on conflict (id) do nothing;
