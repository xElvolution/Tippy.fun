-- Tippy core schema (Postgres on Supabase)
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- Later with Prisma: point DATABASE_URL to Supabase → prisma db pull / introspect

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null unique,
  username text not null,
  global_name text,
  avatar_url text,
  evm_address text not null unique,
  encrypted_private_key text not null,
  key_iv text not null,
  key_tag text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_discord_id on public.users (discord_id);

create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.users (id) on delete cascade,
  to_user_id uuid not null references public.users (id) on delete cascade,
  denom text not null default 'cfx',
  amount text not null,
  tx_hash text,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tips_from on public.tips (from_user_id);
create index if not exists idx_tips_to on public.tips (to_user_id);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  to_address text not null,
  denom text not null,
  amount text not null,
  tx_hash text,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists public.point_currencies (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null,
  channel_id text,
  owner_discord_id text not null,
  name text not null,
  symbol text not null,
  cap text not null,
  minted_total text not null default '0',
  created_at timestamptz not null default now()
);

create index if not exists idx_point_currencies_guild on public.point_currencies (guild_id);

create table if not exists public.point_balances (
  id uuid primary key default gen_random_uuid(),
  point_currency_id uuid not null references public.point_currencies (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  balance text not null default '0',
  unique (point_currency_id, user_id)
);

create table if not exists public.airdrop_rules (
  id uuid primary key default gen_random_uuid(),
  point_currency_id uuid not null references public.point_currencies (id) on delete cascade,
  template text not null,
  params_json text not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Optional: enable RLS and add policies when you expose anon key to the browser.
-- Service role (server + bot) bypasses RLS.

comment on table public.users is 'Custodial Conflux eSpace users; keys encrypted at rest';
comment on table public.tips is 'On-chain tip audit trail';
comment on table public.point_currencies is 'Guild-owner project points (off-chain ledger until CW20)';
