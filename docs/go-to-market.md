# Tippy.Fun — Go-to-market plan

## Who we're for

Three concentric rings of users, in priority order:

1. **Ecosystem / hackathon teams** who want to run bounties on-chain without building another
   custodial DoraHack clone. Tippy is the reference implementation of "fund, submit, AI-judge,
   pay — all on-chain." They pay 0 in protocol fees and ship in minutes.
2. **Crypto-native community operators** running Discord / Telegram campaigns today with
   spreadsheets + Google Forms + off-chain payouts. They get a rubric-driven AI panel and an
   always-on Tip mode that auto-pays quality content.
3. **Creators** who want a Patreon-style tip jar with on-chain receipts, AI-graded quality
   control, and no 10% cut.

## Wedge

Open-source, non-custodial, zero protocol fee, AI-judged, dual-mode. We replace a spreadsheet,
a DM shortlist, and a promise with a single Solidity contract (`TippyMaker.sol`), an AI
judging panel, and a polished Next.js UI. The **Tip mode** is the unique twist: an always-on
campaign that rewards submitters instantly when the AI arbiter says pass.

Time-to-value test: a new organizer should have a funded campaign live in **under 5 minutes**
from opening the site.

## Why now, why Conflux

- Conflux eSpace gives us cheap EVM transactions with native-CFX settlement — tips / claims
  / payouts stay sub-cent even at scale, which matters when a Tip-mode campaign might fan out
  hundreds of micro-payments a day.
- **USDT0** and **AxCNH** are both first-class prize tokens in the create flow, unlocking
  the Conflux category prizes as a built-in product feature rather than a roadmap item.
- The Conflux ecosystem is actively funding builders (Global Hackfest 2026, Conflux Forum
  grants); community-growth + AI-ops tooling is an obvious gap.
- **Privy** (ecosystem partner) removes the adoption wall: users log in with email, Google,
  or Twitter and get a Conflux eSpace wallet transparently.

## Distribution plan

**Days 0–30 (post-submission)**

- Ship **Telegram + Discord bot submission flow** so participants can submit from where they
  already hang out. The web contract + hashing pipeline already works; the bots just POST to
  `/api/submissions`.
- Offer **free white-glove setup for the first 10 launch communities** in the Conflux
  ecosystem; collect feedback and testimonials.
- Publish a template on Conflux's dev hub / Forum thread so teams can clone Tippy in one click.
- Record a <2-minute "launch a bounty in 5 minutes" screencast.

**Days 30–90**

- Category templates (AI-ops bounties, QA sprints, meme marketing, docs translation,
  always-on content tipping) so organizers start from tuned presets.
- Integration partnerships with 2–3 Conflux ecosystem projects that need recurring
  incentives (governance campaigns, meme contests, liquidity-mining bonuses).
- Public leaderboard ("Top campaigns this week on Tippy") to flywheel the tipper side.
- Add Anthropic + Google models to the judge picker so organizers can mix providers.

**Days 90–180**

- Community-run AI judging validators: multiple independent orgs each run a judge API, so
  the "3-judge panel" is literally three different operators instead of three OpenAI calls.
- Cross-Space bridge support (Core ↔ eSpace) + a Conflux `SponsorWhitelistControl`
  integration so participants pay zero gas to claim.

## Metrics that matter

| Metric | Target in 90 days |
| --- | --- |
| Campaigns launched on mainnet | 150 |
| Total prize value escrowed (CFX + USDT0 + AxCNH) | $500k-equivalent |
| AI-judged submissions | 5,000 |
| Winner settlement time (judging → paid) | median < 1 hour (Bounty) / < 1 minute (Tip) |
| Tippers / campaign (organic) | > 20 |
| Operator NPS | > 50 |

## Unit economics (post-hackathon)

- **Product stays free** at the contract level — no protocol fee, ever. This is the moat:
  anyone can fork Tippy and redeploy; few will, because the social layer (feed, discovery,
  templates, judging history) is where we compound.
- **Optional organizer tip** on payouts (default 0) — Buy-Me-a-Coffee style.
- **Sponsor slots** on the explore page once there's real traffic.
- **Paid AI-judging credits** once the multi-provider panel is productionized (OpenAI /
  Anthropic / Google costs are the actual pass-through; operators can always BYO API keys for
  free).

## Risks and mitigations

- **"AI judging is still a black box."** Mitigation: every arbiter verdict is hashed
  on-chain from day 1 (we already do this via `verdictHash`), and Supabase stores the full
  rationales so sponsors can spot-check; ship multi-operator validators in the 90–180 window.
- **"Contract is a single honeypot."** Mitigation: no admin keys, no upgrade path, organizer
  is the only address that can move funds and only to winners, submitters, or back to
  themselves; simple surface = small audit footprint. Audit via Code4rena / Sherlock contest
  once we pass $1M escrowed.
- **Operator chargebacks / regulatory.** Mitigation: organizer-funded means we never touch
  the funds; we're publishing a tool, not operating a marketplace.

## 30-60-90 day checklist

**30 days**

- [ ] Telegram bot submission flow live (`/tippy-submit`).
- [ ] Discord bot parity.
- [ ] Vercel production, ConfluxScan-verified mainnet contract.
- [ ] 10 pilot campaigns across Bounty + Tip modes.
- [ ] USDT0 + AxCNH live on mainnet (config switch only — the product already supports it).

**60 days**

- [ ] Campaign templates (AI-ops, QA, memes, docs, always-on tip jar).
- [ ] Anthropic + Google models added to the judge picker.
- [ ] Integration partnership with at least 1 top-30 Conflux ecosystem project.
- [ ] Public leaderboard + share-cards.

**90 days**

- [ ] Multi-operator AI judging validators.
- [ ] Cross-Space bridge support.
- [ ] First paid Code4rena / Sherlock audit finished.
