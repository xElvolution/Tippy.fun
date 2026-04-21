# Tippy.Fun

**Non-custodial bounties and always-on tipping, judged by AI, settled on Conflux eSpace.**

Tippy.Fun is a DoraHacks-style launchpad where the judges are AI agents and the prize escrow
lives on-chain. Organizers spin up a campaign in two clicks, pick the prize token (CFX, USDT0 or
AxCNH), set the AI rubric, and participants submit work straight from the site. A panel of
OpenAI-powered judges plus an AI arbiter scores every entry; the arbiter's verdict hash is
written on-chain on [Conflux eSpace](https://doc.confluxnetwork.org/docs/espace/Overview), and
rewards are either queued for winners to claim or paid out instantly — with zero custodian in
the middle.

## Two modes, one contract

Everything lives in **`TippyMaker.sol`**, a single non-custodial multi-campaign registry. When
the organizer creates a campaign they pick one of two modes:

### 1. Bounty / Hackathon mode (claim-based)

- Organizer sets a submissions window **and** a claim deadline.
- AI judging produces a ranked list; the organizer publishes winners with `settleWinners`.
- Each winner has a personal entitlement they call `claim` on before the deadline.
- Anything unclaimed by the deadline can be reclaimed by the organizer with `reclaimUnclaimed`
  — funds are never stuck and never move without the winner's explicit tx.

### 2. Tip / Always-on mode (auto-pay)

- Organizer fixes a reward-per-submission and a pass threshold.
- Participants submit; the AI panel scores, the arbiter decides pass/fail.
- On `pass`, the contract **transfers the reward instantly** to the submitter via `payTip` —
  no claim step, no human in the loop. Perfect for always-on tip jars / content contests.

Both modes share the same AI pipeline and the same on-chain audit surface.

## How AI judging works

1. Organizer writes the **criteria** and picks a **judge panel** (today: three OpenAI models
   with different personas — strict technical reviewer, creative reviewer, rubric-follower).
2. When they hit **Run AI judging**, `/api/judging/run` dispatches each submission to every
   judge concurrently. Each verdict (score 0-100 + rationale) is stored in Supabase.
3. An **AI arbiter** (OpenAI) receives all three verdicts and produces the final aggregated
   score + pass/fail decision + rationale.
4. The arbiter's full blob is canonicalised and hashed with `keccak256`. That hash is the
   `verdictHash` attached on-chain to `settleWinners` / `payTip` / `WinnerSettled` /
   `TipPaid` events. Anyone can re-run the hashing off-chain and verify the AI didn't move.
5. Full rationales + per-judge scores stay in Supabase where they're human-readable; only the
   digest goes on-chain (cheap, tamper-evident).

> v1 uses **OpenAI only** for judges and arbiter. The pipeline is provider-agnostic; additional
> providers (Anthropic, Google, local models) are a roadmap item.

## Conflux integration

- **Space**: Conflux eSpace (EVM). Mainnet `1030`, testnet `71`.
- **Contract**: `TippyMaker.sol` — shared non-custodial multi-campaign registry.
- **Native token**: CFX prize pools work with zero extra config.
- **ERC-20 prizes**: **USDT0** and **AxCNH** are first-class choices in the create flow
  (targets the _Best USDT0_ and _Best AxCNH_ category prizes). The deploy script ships mock
  `TestERC20` contracts on testnet so the full flow is reviewable without real tokens; on
  mainnet set `NEXT_PUBLIC_USDT0_ADDRESS` / `NEXT_PUBLIC_AXCNH_ADDRESS` to the real addresses.
- **Privy** is the connect/auth partner — email, Google, Twitter, external wallet, plus
  embedded wallets for non-crypto users. Server-side we verify the Privy access token before
  touching Supabase.
- **Explorer**: every payout / tip / verdict deep-links to `evm.confluxscan.io` in the UI.
- **Roadmap**: Conflux `SponsorWhitelistControl` for gas-sponsored tips, Core ↔ eSpace bridge.

## Architecture

```
+-----------------------------+      write tx        +--------------------------+
|  web/  (Next.js 16 app)     | ------------------>  |  Conflux eSpace (71/1030)|
|  - Privy auth               |    via viem+wagmi    |  TippyMaker.sol          |
|  - Create / tip / claim UI  |                      |   createCampaign         |
|  - AI judging panel         |    events            |   fund / tip             |
|  - Audit ledger             | <------------------  |   settleWinners / claim  |
+------+----------+-----------+                      |   payTip / reclaim       |
       |          |                                  +----------+---------------+
       |          |                                             |
       |      +---+-----------------+                           | events
       |      |  /api/judging/run   |  verdicts + hash          v
       |      |  /api/submissions   |  submissions     +-------------------+
       |      |  /api/judging/plan  |  plans           |  /api/indexer     |
       |      |  /api/judging/verdicts                 |  (cron)           |
       |      +---+-----------------+                  +---------+---------+
       |          |                                              |
       |          v                                              v
       |   +------+---------------+                +-------------+-------------+
       |   |  OpenAI (judges +    |                |  Supabase (Postgres +     |
       |   |  arbiter)            |                |  Storage)                 |
       |   +----------------------+                |   submissions             |
       |                                           |   ai_verdicts             |
       +------------ browser reads public cache -> |   final_verdicts          |
                                                   |   settlement_plans        |
                                                   |   campaigns_cache         |
                                                   |   tips_cache / payouts    |
                                                   +---------------------------+
```

Contract is the source of truth; Supabase caches events + stores the human-readable side of
AI judging so the UI is snappy and organizers can review before broadcasting.

## Hackathon

Global Hackfest 2026 (2026-03-23 – 2026-04-20) on [Conflux](https://confluxnetwork.org).
Category focus: **Best AI + Conflux**. Also targets: **Best Developer Tool**, **Best DeFi
project** (non-custodial escrow), **Best USDT0 integration**, **Best AxCNH integration**, and
the **Privy partner integration**.

## Team

- Elvolution — GitHub: `xElvolution` — Discord: `Elvolution#9060`


## Problem

Community bounties today are custodial by default: prize pools sit in an operator wallet,
judging is opaque, winners chase payouts for weeks, and sponsors have no way to verify funds
were actually distributed. Existing Web3 bounty boards copy the same flow but charge a fee.

## Solution

Tippy.Fun replaces the custodian with `TippyMaker.sol` and replaces the judging black box with
a deterministic AI panel whose verdict is hashed on-chain. Two modes cover the realistic
shapes of the work: a **claim-based bounty / hackathon mode** with a grace window, and a
**tip-style always-on mode** that auto-pays approved submissions. No protocol fee. No admin
key. No upgrade path.

## Features

- `TippyMaker.sol` — one non-custodial registry, dual modes, native CFX and ERC-20 (USDT0,
  AxCNH) prize pools, verdict hash on every payout, events for the whole ledger.
- AI judging pipeline — configurable panel of OpenAI judges + arbiter, rubric set per
  campaign, full rationales cached in Supabase.
- Submit-from-site flow — participants post work directly from the campaign page; content is
  keccak-hashed so `settleWinners` / `payTip` can reference the exact submission.
- Claim card with countdown for Bounty mode; instant `payTip` panel for Tip mode.
- Privy connect — email, Google, Twitter, wallet, embedded wallet. Server-side verification
  of the access token before any Supabase write.
- Live audit strip — `OnChainLedger` rebuilds the whole campaign from `TippyMaker` events so
  anyone can independently audit, even if Supabase is down.
- `/api/indexer` — lightweight server-side indexer that mirrors events into Supabase for
  social feeds and search.

## Technology stack

- **Frontend**: Next.js 16 (App Router, React 19, React Compiler), Tailwind v4, Framer Motion.
- **Wallets / auth**: [Privy](https://www.privy.io/) (client + server) + [wagmi](https://wagmi.sh/) + [viem](https://viem.sh/).
- **Smart contracts**: Solidity `0.8.24`, Hardhat, `@nomicfoundation/hardhat-toolbox`, `viaIR`.
- **Blockchain**: Conflux eSpace (mainnet `1030`, testnet `71`).
- **Data / AI**: Supabase (Postgres + Storage + RLS), OpenAI (`gpt-4o`, `gpt-4o-mini`).
- **Testing**: Hardhat + Chai for contracts.

## Setup

### Prerequisites

- Node.js v20+
- [pnpm](https://pnpm.io/) 9+
- A Privy application (<https://dashboard.privy.io>) with Conflux eSpace added
- A Supabase project (<https://supabase.com>)
- An OpenAI API key
- A funded wallet on Conflux eSpace testnet — faucet: <https://efaucet.confluxnetwork.org>

### 1. Install

```bash
git clone https://github.com/<your-org>/tippy-fun
cd tippy-fun
pnpm -C web install
pnpm -C contracts install
```

### 2. Deploy the contract

```bash
cd contracts
cp .env.example .env     # fill in DEPLOYER_PRIVATE_KEY
pnpm compile
pnpm test
pnpm deploy:testnet      # deploys TippyMaker + TestERC20 mocks on testnet
```

`deploy:testnet` prints the exact lines to paste into `web/.env.local` for
`NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS`, `NEXT_PUBLIC_USDT0_ADDRESS`, and
`NEXT_PUBLIC_AXCNH_ADDRESS`. A record also lands in `contracts/deployments/<network>.json`.

### 3. Supabase

```bash
# In the Supabase SQL editor, run:
web/supabase/migrations/0001_init.sql
```

Grab `Project URL`, `anon public` key and `service_role` key from Project Settings → API.

### 4. Configure the web app

```bash
cd ../web
cp .env.example .env.local
# edit .env.local:
#   NEXT_PUBLIC_PRIVY_APP_ID=<dashboard.privy.io>
#   PRIVY_APP_SECRET=<dashboard.privy.io>
#   NEXT_PUBLIC_CONFLUX_CHAIN=testnet
#   NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS=0x…     # from deploy script
#   NEXT_PUBLIC_USDT0_ADDRESS=0x…              # optional but recommended
#   NEXT_PUBLIC_AXCNH_ADDRESS=0x…              # optional but recommended
#   NEXT_PUBLIC_SUPABASE_URL=https://…supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=…
#   SUPABASE_SERVICE_ROLE_KEY=…                # server only
#   OPENAI_API_KEY=sk-…
```

### 5. Run

```bash
pnpm dev
```

Open <http://localhost:3000> and hit **Connect wallet** (top-right).

### Testing

```bash
pnpm -C contracts test
pnpm -C web lint
pnpm -C web build
```

## Usage

1. **Connect** via Privy — email / Google / Twitter / wallet.
2. **Create a campaign** — pick **Bounty** or **Tip** mode, prize token (CFX / USDT0 / AxCNH),
   seed amount, submissions window, and (Bounty) claim deadline. Write the AI rubric. Launch.
3. **Submit** — participants post work on the campaign's Submissions tab; the app hashes the
   canonical payload so it can be linked on-chain.
4. **Run AI judging** — organizer opens the Judging tab and clicks **Run AI judging**. Three
   judges + arbiter score every submission. The arbiter's verdict hash is displayed.
5. **Settle / Pay**:
   - **Bounty mode** → organizer clicks **Publish N winners**. `settleWinners` goes on-chain
     with the verdict hash. Each winner sees a claim card with countdown and hits **Claim**
     before the deadline. Anything unclaimed → `reclaimUnclaimed`.
   - **Tip mode** → organizer hits **Pay** next to any passing submission. `payTip` transfers
     the prize instantly from escrow to the submitter's wallet.
6. **Audit** — `Campaign → Funds` shows the full ledger, rebuilt from `TippyMaker` events.
7. **Finalize** — when everything is paid out, call `finalize` to close the campaign and
   return any dust to the organizer. No funds are ever stuck.

## Smart contracts

- `TippyMaker` — deploy per-chain; address printed by `deploy:testnet` / `deploy:mainnet`.
- `TestERC20` (mocks) — deployed on testnet only, used for USDT0 / AxCNH demos.
- Source: [`contracts/contracts/TippyMaker.sol`](contracts/contracts/TippyMaker.sol)
- Tests: [`contracts/test/TippyMaker.test.ts`](contracts/test/TippyMaker.test.ts)

## Roadmap

- Discord + Telegram bot entrypoints so participants can submit from community chats (the web
  submit flow + hashing is a drop-in for the bots — this repo ships the web-only MVP).
- Additional AI providers (Anthropic, Google, local models) in the judging panel.
- Conflux `SponsorWhitelistControl` → zero-gas tipping / claiming for participants.
- On-chain campaign search via an indexer service (Supabase cache is v1; a subgraph / Goldsky
  integration is the long-term plan).
- Organizer-set optional protocol tip (default 0) + sponsor featured slots.


## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [Conflux Network](https://confluxnetwork.org) and the Global Hackfest 2026 team.
- [Privy](https://www.privy.io/) for auth + embedded wallets.
- [OpenAI](https://platform.openai.com/) for the judging panel.
- [Supabase](https://supabase.com) for Postgres + Storage.
- [wagmi](https://wagmi.sh) / [viem](https://viem.sh) for EVM client libraries.
- [Hardhat](https://hardhat.org) for the contract toolchain.
