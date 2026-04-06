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
