-- Per-user tokens to show on the dashboard (bank denom or CW20 contract).

create table if not exists public.user_dashboard_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  token_type text not null check (token_type in ('bank', 'cw20')),
  ref text not null,
  label text not null default 'Token',
  decimals int not null default 6,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_dashboard_tokens_user on public.user_dashboard_tokens (user_id);
create unique index if not exists user_dashboard_tokens_user_type_ref
  on public.user_dashboard_tokens (user_id, token_type, lower(ref));

comment on table public.user_dashboard_tokens is 'User-added bank denoms or CW20 contracts shown on /api/me/dashboard';
