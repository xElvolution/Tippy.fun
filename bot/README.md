# Tippy

Next.js dashboard + Discord bot: **custodial Conflux eSpace (EVM) wallets** (keys encrypted with `ENCRYPTION_KEY`, metadata in **Supabase**), **on-chain CFX / ERC-20 tips**, and **guild project points** (capped ledger in Postgres).

## Stack

| Piece | Tech |
|--------|------|
| Web | Next.js 14, Tailwind, pnpm |
| Database | **Supabase (Postgres)** via `@supabase/supabase-js` + service role on server/bot |
| Chain | **Conflux eSpace** via [viem](https://viem.sh) (`testnet` chain 71 / `mainnet` 1030 via `CONFLUX_NETWORK`) |
| Bot | `discord.js` + shared `lib/` |

### Why Supabase now, Prisma later?

- Supabase gives you **hosted Postgres**, dashboard, backups, and optional **Auth/Realtime** without an ORM.
- When you want Prisma: copy **`DATABASE_URL`** from Supabase (**Settings → Database → URI**), run `npx prisma db pull` (or introspect), then replace direct Supabase calls with Prisma - **same tables**, no vendor lock-in for the schema.

## Prerequisites

- Node.js LTS, pnpm 9 (`corepack enable`)
- A [Supabase](https://supabase.com) project
- Discord app + bot - see **[docs/DISCORD_SETUP.md](docs/DISCORD_SETUP.md)** (step-by-step: Client ID, bot token, invite URL, `DISCORD_GUILD_ID`)

## 1. Database (Supabase)

1. Create a project → **SQL Editor** → paste and run `supabase/migrations/001_initial.sql`.
2. **Existing installs** that still have `injective_address`: run `supabase/migrations/003_rename_injective_to_evm.sql` once.
3. **Settings → API**: copy **Project URL** and **service_role** key into `.env` (see below).

## 2. Environment

```bash
cp .env.example .env
```

**Discord:** full walkthrough → [docs/DISCORD_SETUP.md](docs/DISCORD_SETUP.md).

Fill at minimum:

- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_KEY` (64 hex chars)
- `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, **`DISCORD_CLIENT_SECRET`** (OAuth2 secret from the portal - required for real **Log in with Discord** on the site)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (e.g. `http://localhost:3000`) - see [docs/DISCORD_SETUP.md §7](docs/DISCORD_SETUP.md)
- `NEXT_PUBLIC_DISCORD_CLIENT_ID` - same value as `DISCORD_CLIENT_ID`; enables the landing page **Add to Discord** invite
- `DISCORD_GUILD_ID` (recommended for instant slash commands - see Discord guide §4)
- `CONFLUX_NETWORK=testnet` and `NEXT_PUBLIC_CONFLUX_NETWORK=testnet` until you are ready for mainnet

## 3. Install & run

```bash
pnpm install
pnpm dev:all
```

- Web: [http://localhost:3000](http://localhost:3000)
- Health: [http://localhost:3000/api/health](http://localhost:3000/api/health) (checks Supabase connectivity)
- **Marketing page:** [`/landing`](/landing) - public hero (same content as logged-out home). Logo in the app sidebar/header links here.
- **In-app routes (query):** `/?view=activity` → Activity; `/?view=console` → Owner console; `/?view=help` / `settings`; no `view` → Dashboard. Set `NEXT_PUBLIC_APP_URL` to the **origin only** (no `/console` path) unless you intend that screen on every open.

### Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Next.js only |
| `pnpm dev:bot` | Bot only (watch) |
| `pnpm dev:all` | Web + bot |
| `pnpm build` / `pnpm start` | Production web |
| `pnpm start:bot` | Bot (no watch) |
| `pnpm run contracts:compile` | Compile Solidity (Hardhat in `contract/hardhat`) |
| `pnpm run deploy:contracts` | Deploy MasterTip + TestUSDT to Conflux eSpace **testnet** |

## Discord flow (summary)

1. Invite bot with **applications.commands** + **bot** scopes.
2. `/register` - creates **Conflux eSpace** `0x` wallet, stores **encrypted** private key in `users.evm_address` + vault fields.
3. Fund the address with **CFX** on the configured network (testnet faucet for demos).
4. `/balance` - reads on-chain CFX (+ optional `TEST_ERC20_CONTRACT`, dashboard ERC-20 list).
5. `/tip @user amount` - native CFX or ERC-20 via viem; row in `tips`.
6. `/points` - guild **owner** creates capped currencies (Postgres ledger); mint/send/balance subcommands.

## Repo layout

```
lib/                 # Shared: Supabase admin client, crypto, Conflux eSpace (viem), db accessors
bot/                 # Discord entry (tsx)
src/app/             # Next.js App Router
supabase/migrations/ # SQL to apply in Supabase
contract/hardhat/    # Solidity + Hardhat (MasterTip, TestUSDT) for Conflux eSpace
contract/contracts/  # Legacy CosmWasm (Injective only)
```

## Security notes

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` or `ENCRYPTION_KEY` to the client.
- Custodial keys are **high risk**; use KMS/HSM and key rotation for anything beyond demos.
- Add **RLS** + `anon` policies before using `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the browser.

## Prisma migration (later)

1. Supabase → **Settings → Database** → copy **connection string** (URI).
2. `DATABASE_URL="postgresql://..." npx prisma db pull`
3. Replace `lib/db/*` Supabase calls with Prisma queries incrementally.
