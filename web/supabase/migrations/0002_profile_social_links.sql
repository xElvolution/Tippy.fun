-- Tippy.Fun 0002: Extend profiles with social link columns and avatar seed.
--
-- Introduced alongside the /register onboarding flow and the public /u/[handle]
-- profile pages. Everything is additive; the indexer and existing /api/profile
-- routes keep working against the 0001 columns.

-- Ensure the base profiles columns exist (safe if 0001 was already applied, or
-- if an older profiles table predates the 0001 migration entirely).
alter table public.profiles
  add column if not exists handle text,
  add column if not exists display_name text,
  add column if not exists avatar_url text,
  add column if not exists wallet_address text,
  add column if not exists twitter_handle text,
  add column if not exists twitter_subject text,
  add column if not exists discord_handle text,
  add column if not exists discord_subject text,
  add column if not exists avatar_seed text;

create unique index if not exists profiles_twitter_subject_uidx
  on public.profiles (twitter_subject)
  where twitter_subject is not null;

create unique index if not exists profiles_discord_subject_uidx
  on public.profiles (discord_subject)
  where discord_subject is not null;

create unique index if not exists profiles_handle_lower_uidx
  on public.profiles (lower(handle))
  where handle is not null;
