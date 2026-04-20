# Tippy · Supabase

Minimal Supabase project used as a cache + metadata + AI-judging log on top of the `TippyMaker`
contract. The blockchain is the source of truth; Supabase is a fast read layer and the place
where off-chain artifacts (submission content, judge rationales) actually live.

## Tables

| Table | Purpose |
| --- | --- |
| `profiles` | Privy-authenticated user profiles. |
| `campaigns_cache` | Mirror of on-chain campaign state, populated by the indexer route. |
| `tips_cache` | Tip / fund events, used by the social feed. |
| `payouts_cache` | Settle / claim / reclaim / tip-paid events, used by the audit strip. |
| `indexer_cursor` | Last block indexed per chain (idempotent). |
| `submissions` | Participant work, content + submission hash. |
| `ai_verdicts` | Raw per-judge AI scores + rationales. |
| `final_verdicts` | Arbiter's aggregated score + `verdict_hash` (matches on-chain hash). |
| `settlement_plans` | Proposed on-chain payout batch the organizer reviews before broadcasting. |

## Storage buckets

- `campaign-metadata` – public JSON / image assets referenced by the on-chain `metadataURI`.
- `submission-assets` – participant uploads, referenced from `submissions.attachments`.

## Apply the migration

```bash
# Requires the Supabase CLI (https://supabase.com/docs/guides/cli)
pnpm dlx supabase@latest init        # first time only
pnpm dlx supabase db push            # applies web/supabase/migrations/*.sql to your project
```

Or, if you prefer the dashboard:

1. Create a new Supabase project.
2. Paste the contents of `migrations/0001_init.sql` into the SQL editor and run.
3. Copy the project URL, anon key, and service role key into `web/.env.local`.

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only, never exposed to the browser
```

All Tippy API routes talk to Supabase using the service role key and verify the caller's Privy
session before mutating anything, so we don't rely on client-side RLS policies for security.
