begin;

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
);

create type public.plan_code as enum (
  'free',
  'pro',
  'business'
);

create table if not exists public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  stripe_product_id text,
  plan public.plan_code not null default 'free',
  status public.subscription_status,
  interval text,
  currency text,
  amount_unit integer,
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_organization_id_idx
  on public.billing_subscriptions (organization_id);

create index if not exists billing_subscriptions_stripe_customer_id_idx
  on public.billing_subscriptions (stripe_customer_id);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  livemode boolean not null default false,
  processed_at timestamptz,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_entitlements (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  plan public.plan_code not null default 'free',
  max_operators integer not null default 3,
  max_saved_views integer not null default 3,
  can_use_advanced_filters boolean not null default false,
  can_use_analytics boolean not null default false,
  can_use_priority_support boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.organization_entitlements (organization_id)
select id
from public.organizations
on conflict (organization_id) do nothing;

create or replace function public.create_default_organization_entitlements()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.organization_entitlements (organization_id)
  values (new.id)
  on conflict (organization_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_organizations_default_entitlements on public.organizations;
create trigger trg_organizations_default_entitlements
after insert on public.organizations
for each row
execute function public.create_default_organization_entitlements();

drop trigger if exists trg_billing_customers_set_updated_at on public.billing_customers;
create trigger trg_billing_customers_set_updated_at
before update on public.billing_customers
for each row
execute function public.set_updated_at();

drop trigger if exists trg_billing_subscriptions_set_updated_at on public.billing_subscriptions;
create trigger trg_billing_subscriptions_set_updated_at
before update on public.billing_subscriptions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_organization_entitlements_set_updated_at on public.organization_entitlements;
create trigger trg_organization_entitlements_set_updated_at
before update on public.organization_entitlements
for each row
execute function public.set_updated_at();

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_events enable row level security;
alter table public.organization_entitlements enable row level security;

create policy "billing_customers_select_admin"
on public.billing_customers
for select
to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin']::public.organization_role[]
  )
);

create policy "billing_subscriptions_select_admin"
on public.billing_subscriptions
for select
to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin']::public.organization_role[]
  )
);

create policy "organization_entitlements_select_member"
on public.organization_entitlements
for select
to authenticated
using (public.is_member_of_org(organization_id));

commit;
