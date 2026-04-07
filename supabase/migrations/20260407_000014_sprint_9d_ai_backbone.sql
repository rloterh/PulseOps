begin;

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  requested_by_user_id uuid not null references public.profiles(id) on delete cascade,
  task_key text not null,
  prompt_version text not null default 'sprint9-v1',
  provider text not null default 'pulseops-deterministic',
  model text not null default 'heuristic-v1',
  status text not null default 'pending',
  input_hash text not null,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb,
  fallback_reason text,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_runs_status_check
    check (status in ('pending', 'completed', 'failed')),
  constraint ai_runs_task_key_check
    check (task_key in ('analytics_overview')),
  constraint ai_runs_input_hash_length_check
    check (char_length(trim(input_hash)) >= 32),
  constraint ai_runs_request_payload_object_check
    check (jsonb_typeof(request_payload) = 'object'),
  constraint ai_runs_response_payload_object_check
    check (
      response_payload is null
      or jsonb_typeof(response_payload) = 'object'
    )
);

create index if not exists ai_runs_org_task_created_idx
  on public.ai_runs (organization_id, task_key, created_at desc);

create index if not exists ai_runs_org_task_hash_idx
  on public.ai_runs (organization_id, task_key, input_hash, completed_at desc);

create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  ai_run_id uuid not null references public.ai_runs(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating text not null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_feedback_rating_check
    check (rating in ('helpful', 'not_helpful')),
  constraint ai_feedback_comment_length_check
    check (comment is null or char_length(comment) <= 500)
);

create unique index if not exists ai_feedback_run_user_idx
  on public.ai_feedback (ai_run_id, user_id);

create index if not exists ai_feedback_org_created_idx
  on public.ai_feedback (organization_id, created_at desc);

drop trigger if exists trg_ai_runs_set_updated_at on public.ai_runs;
create trigger trg_ai_runs_set_updated_at
before update on public.ai_runs
for each row
execute function public.set_updated_at();

drop trigger if exists trg_ai_feedback_set_updated_at on public.ai_feedback;
create trigger trg_ai_feedback_set_updated_at
before update on public.ai_feedback
for each row
execute function public.set_updated_at();

alter table public.ai_runs enable row level security;
alter table public.ai_feedback enable row level security;

create policy "ai_runs_select_member"
on public.ai_runs
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "ai_runs_insert_requester"
on public.ai_runs
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = requested_by_user_id
);

create policy "ai_runs_update_requester"
on public.ai_runs
for update
to authenticated
using (
  public.is_member_of_org(organization_id)
  and auth.uid() = requested_by_user_id
)
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = requested_by_user_id
);

create policy "ai_feedback_select_member"
on public.ai_feedback
for select
to authenticated
using (public.is_member_of_org(organization_id));

create policy "ai_feedback_insert_owner"
on public.ai_feedback
for insert
to authenticated
with check (
  public.is_member_of_org(organization_id)
  and auth.uid() = user_id
);

create policy "ai_feedback_update_owner"
on public.ai_feedback
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

commit;
