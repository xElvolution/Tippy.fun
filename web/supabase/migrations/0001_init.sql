-- Tippy.Fun initial schema.
--
-- Only tables we actually need for v1:
--   profiles           – Privy-authenticated user profiles.
--   campaigns_cache    – last-known state of every on-chain campaign (populated by the indexer).
--   tips_cache         – last-known tips / funding rows (for the social feed).
--   payouts_cache      – last-known payouts / claims (for the audit strip).
--   indexer_cursor     – per-chain last-indexed block so the indexer is idempotent.
--   submissions        – participant work submitted to a campaign.
--   ai_verdicts        – raw per-judge verdicts the AI judging service writes.
--   final_verdicts     – arbiter's aggregated ranking per submission.
--   settlement_plans   – proposed on-chain settlement the organizer reviews before broadcasting.
--
-- Row-level security is enabled on every table. The service role (used by our server-side
-- API routes) bypasses RLS; clients never talk to Supabase directly, so policies are
-- intentionally restrictive.

create extension if not exists "uuid-ossp";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  privy_id text unique not null,
  handle text unique,
  display_name text,
  avatar_url text,
  wallet_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_wallet_idx on public.profiles (lower(wallet_address));

-- ---------- campaigns_cache ----------
create table if not exists public.campaigns_cache (
  chain_id int not null,
  campaign_id numeric not null,
  organizer text not null,
  token text not null,
  mode smallint not null check (mode in (0, 1)),
  metadata_uri text not null,
  metadata jsonb,
  prize_pool numeric not null default 0,
  total_funded numeric not null default 0,
  total_tipped numeric not null default 0,
  total_paid_out numeric not null default 0,
  total_entitled numeric not null default 0,
  submissions_close timestamptz,
  claim_deadline timestamptz,
  created_at timestamptz not null,
  finalized boolean not null default false,
  latest_verdict_hash text,
  last_indexed_block numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (chain_id, campaign_id)
);
create index if not exists campaigns_cache_organizer_idx
  on public.campaigns_cache (chain_id, lower(organizer));
create index if not exists campaigns_cache_created_idx
  on public.campaigns_cache (chain_id, created_at desc);

-- ---------- tips_cache ----------
create table if not exists public.tips_cache (
  chain_id int not null,
  campaign_id numeric not null,
  log_index int not null,
  block_number numeric not null,
  tx_hash text not null,
  from_address text not null,
  amount numeric not null,
  note text,
  kind text not null check (kind in ('tip', 'fund')),
  created_at timestamptz not null default now(),
  primary key (chain_id, tx_hash, log_index)
);
create index if not exists tips_cache_campaign_idx
  on public.tips_cache (chain_id, campaign_id, block_number desc, log_index desc);

-- ---------- payouts_cache ----------
create table if not exists public.payouts_cache (
  chain_id int not null,
  campaign_id numeric not null,
  log_index int not null,
  block_number numeric not null,
  tx_hash text not null,
  kind text not null check (kind in ('settled', 'claimed', 'reclaimed', 'tip_paid')),
  to_address text,
  amount numeric,
  submission_hash text,
  verdict_hash text,
  note text,
  created_at timestamptz not null default now(),
  primary key (chain_id, tx_hash, log_index)
);
create index if not exists payouts_cache_campaign_idx
  on public.payouts_cache (chain_id, campaign_id, block_number desc, log_index desc);

-- ---------- indexer_cursor ----------
create table if not exists public.indexer_cursor (
  chain_id int primary key,
  last_block numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------- submissions ----------
create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  chain_id int not null,
  campaign_id numeric not null,
  submitter_privy_id text not null,
  submitter_wallet text,
  title text,
  content text not null,
  links jsonb,
  attachments jsonb,
  submission_hash text not null, -- keccak256(canonical payload), matches on-chain hash
  status text not null default 'pending'
    check (status in ('pending', 'judging', 'scored', 'paid', 'rejected')),
  score numeric, -- arbiter's final score once available
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chain_id, campaign_id, submission_hash)
);
create index if not exists submissions_campaign_idx
  on public.submissions (chain_id, campaign_id, created_at desc);
create index if not exists submissions_submitter_idx
  on public.submissions (submitter_privy_id, created_at desc);

-- ---------- ai_verdicts ----------
create table if not exists public.ai_verdicts (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  judge_id text not null,      -- e.g. "judge-a"
  provider text not null,      -- "openai" today
  model text not null,         -- e.g. "gpt-4o"
  persona text not null,
  score numeric not null,      -- 0–100
  rationale text not null,
  flags jsonb,
  raw jsonb,                   -- raw OpenAI response for audit
  created_at timestamptz not null default now(),
  unique (submission_id, judge_id)
);
create index if not exists ai_verdicts_submission_idx on public.ai_verdicts (submission_id);

-- ---------- final_verdicts ----------
create table if not exists public.final_verdicts (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  arbiter_provider text not null,
  arbiter_model text not null,
  score numeric not null,       -- 0–100 aggregated
  rank int,                     -- filled in per-campaign ranking
  decision text not null check (decision in ('pass', 'fail')),
  rationale text not null,
  raw jsonb,
  verdict_hash text not null,   -- keccak256 of canonical verdict blob (off-chain mirror of on-chain hash)
  created_at timestamptz not null default now()
);

-- ---------- settlement_plans ----------
create table if not exists public.settlement_plans (
  id uuid primary key default uuid_generate_v4(),
  chain_id int not null,
  campaign_id numeric not null,
  organizer_privy_id text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'abandoned')),
  winners jsonb not null,       -- [{ submission_id, winner, amount, submission_hash }]
  verdict_hash text not null,
  tx_hash text,                 -- once broadcast
  payout_note text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists settlement_plans_campaign_idx
  on public.settlement_plans (chain_id, campaign_id, created_at desc);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.campaigns_cache enable row level security;
alter table public.tips_cache enable row level security;
alter table public.payouts_cache enable row level security;
alter table public.indexer_cursor enable row level security;
alter table public.submissions enable row level security;
alter table public.ai_verdicts enable row level security;
alter table public.final_verdicts enable row level security;
alter table public.settlement_plans enable row level security;

-- Public read on the cache tables so unauthenticated viewers can browse.
create policy "public read campaigns_cache" on public.campaigns_cache
  for select using (true);
create policy "public read tips_cache" on public.tips_cache
  for select using (true);
create policy "public read payouts_cache" on public.payouts_cache
  for select using (true);
create policy "public read profiles" on public.profiles
  for select using (true);
create policy "public read submissions" on public.submissions
  for select using (true);
create policy "public read final_verdicts" on public.final_verdicts
  for select using (true);

-- Writes are reserved for the service role (bypasses RLS) – no anon policy is granted.

-- ---------- storage buckets ----------
insert into storage.buckets (id, name, public) values
  ('campaign-metadata', 'campaign-metadata', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
  ('submission-assets', 'submission-assets', true)
on conflict (id) do nothing;
