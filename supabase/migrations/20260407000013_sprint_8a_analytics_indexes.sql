create index if not exists jobs_org_created_at_idx
  on public.jobs (organization_id, created_at desc);

create index if not exists jobs_org_location_created_at_idx
  on public.jobs (organization_id, location_id, created_at desc);

create index if not exists jobs_org_status_created_at_idx
  on public.jobs (organization_id, status, created_at desc);

create index if not exists jobs_org_priority_created_at_idx
  on public.jobs (organization_id, priority, created_at desc);

create index if not exists jobs_org_resolved_at_idx
  on public.jobs (organization_id, resolved_at desc)
  where resolved_at is not null;

create index if not exists incidents_org_opened_at_idx
  on public.incidents (organization_id, opened_at desc);

create index if not exists incidents_org_location_opened_at_idx
  on public.incidents (organization_id, location_id, opened_at desc);

create index if not exists incidents_org_status_opened_at_idx
  on public.incidents (organization_id, status, opened_at desc);

create index if not exists work_item_slas_org_entity_created_at_idx
  on public.work_item_slas (organization_id, entity_type, created_at desc);

create index if not exists work_item_slas_org_location_entity_created_at_idx
  on public.work_item_slas (organization_id, location_id, entity_type, created_at desc);

create index if not exists work_item_slas_org_risk_created_at_idx
  on public.work_item_slas (organization_id, risk_level, created_at desc);
