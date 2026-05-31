-- =============================================================================
-- Micro SaaS Engine — Supabase / Postgres schema
-- =============================================================================
-- Run this in the Supabase SQL editor (or `psql`) to provision the tables used
-- by the billing, dashboard, admin and A/B-testing modules.
--
-- Tables:
--   subscriptions  — Stripe subscription state per user (Module 1)
--   user_roles     — role assignments for the admin panel (Module 3)
--   tool_usage     — per-user tool usage events for dashboard stats (Module 2)
--   ab_events      — A/B testing exposures & conversions (Module 5)
-- =============================================================================

create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- subscriptions
-- -----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  plan                   text not null default 'free',   -- free | starter | pro | business
  status                 text not null default 'incomplete', -- active | trialing | past_due | canceled | incomplete
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (user_id)
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

alter table public.subscriptions enable row level security;

-- Users can read their own subscription; writes happen via the service role
-- (Stripe webhook) which bypasses RLS.
drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- user_roles  (admin panel)
-- -----------------------------------------------------------------------------
-- You can either use Supabase user metadata (app_metadata.role) OR this table.
-- The admin helpers read metadata by default; switch lib/admin.ts to query
-- this table if you prefer DB-driven roles.
create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'user',   -- user | admin
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

drop policy if exists "read own role" on public.user_roles;
create policy "read own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Convenience helper to check the current user's role from RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.user_roles where user_id = auth.uid()),
    false
  );
$$;

-- -----------------------------------------------------------------------------
-- tool_usage  (dashboard usage stats)
-- -----------------------------------------------------------------------------
create table if not exists public.tool_usage (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users (id) on delete cascade,
  tool       text not null,            -- e.g. 'image-compressor'
  created_at timestamptz not null default now()
);

create index if not exists tool_usage_user_id_idx on public.tool_usage (user_id);
create index if not exists tool_usage_created_at_idx on public.tool_usage (created_at);

alter table public.tool_usage enable row level security;

drop policy if exists "read own usage" on public.tool_usage;
create policy "read own usage"
  on public.tool_usage for select
  using (auth.uid() = user_id);

drop policy if exists "insert own usage" on public.tool_usage;
create policy "insert own usage"
  on public.tool_usage for insert
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- ab_events  (A/B testing)
-- -----------------------------------------------------------------------------
create table if not exists public.ab_events (
  id              uuid primary key default uuid_generate_v4(),
  experiment_name text not null,
  variant         text not null,       -- 'A' | 'B' | ...
  event           text not null,       -- 'exposure' | 'conversion' | custom
  user_id         uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists ab_events_experiment_idx on public.ab_events (experiment_name);
create index if not exists ab_events_variant_idx on public.ab_events (experiment_name, variant);

-- Events are written by an API route (anon/service); reads are admin-only via
-- the service role. Keep RLS enabled and add policies to taste.
alter table public.ab_events enable row level security;

-- -----------------------------------------------------------------------------
-- updated_at trigger for subscriptions
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();
