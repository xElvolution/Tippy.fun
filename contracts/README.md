# Tippy Contracts

On-chain layer for Tippy.Fun on [Conflux eSpace](https://doc.confluxnetwork.org/docs/espace/Overview).

- **`TippyMaker.sol`**: non-custodial registry that holds the prize pool for every campaign.
  Supports two modes per campaign:
  - **Bounty**: AI judges + AI arbiter rank submissions, organizer publishes the ranking on-chain
    via `settleWinners`, winners pull prizes with `claim` before `claimDeadline`, the organizer
    may `reclaimUnclaimed` afterwards.
  - **Tip**: organizer runs an always-on campaign; the AI pipeline rates each submission and
    the organizer (or their arbiter signer) calls `payTip` to instantly transfer the reward.
  Every payout records a `verdictHash` so the off-chain AI verdict record can be verified against
  the chain. Each campaign chooses its payout token: native CFX (`address(0)`) or any ERC-20
  (e.g. USDT0, AxCNH).
- **`mocks/TestERC20.sol`**: test-only ERC-20 with an open `faucet()` used to simulate USDT0
  and AxCNH on the eSpace testnet end-to-end. Not deployed to mainnet.

No admin, no protocol fee, no upgrade path. Funds only move to winners or back to the organizer.

## Setup

```bash
cd contracts
pnpm install
cp .env.example .env
# edit .env with DEPLOYER_PRIVATE_KEY funded from the eSpace faucet
```

Testnet faucet: <https://efaucet.confluxnetwork.org/>

## Compile & test

```bash
pnpm compile
pnpm test
```

## Deploy

```bash
# Conflux eSpace testnet (chainId 71) – also deploys tUSDT0 + tAxCNH mocks
pnpm deploy:testnet

# Conflux eSpace mainnet (chainId 1030) – only TippyMaker
pnpm deploy:mainnet
```

The deploy script writes `deployments/<network>.json` with every address and prints the env lines
to paste into `web/.env.local`:

```
NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS=0x…
NEXT_PUBLIC_CONFLUX_CHAIN=testnet            # or mainnet
NEXT_PUBLIC_USDT0_ADDRESS=0x…                # tUSDT0 mock on testnet, real USDT0 on mainnet
NEXT_PUBLIC_AXCNH_ADDRESS=0x…                # tAxCNH mock on testnet, real AxCNH on mainnet
```

## Verify

```bash
pnpm verify:testnet 0xYourDeployedAddress
```

A ConfluxScan API key in `CONFLUXSCAN_API_KEY` enables auto-verification at the end of the deploy
script.

## Networks

| Network | Chain ID | RPC | Explorer |
| --- | --- | --- | --- |
| Conflux eSpace testnet | `71` | `https://evmtestnet.confluxrpc.com` | <https://evmtestnet.confluxscan.io> |
| Conflux eSpace mainnet | `1030` | `https://evm.confluxrpc.com` | <https://evm.confluxscan.io> |

## Events (consumed by the Tippy frontend + indexer)

- `CampaignCreated(id, organizer, token, mode, metadataURI, submissionsClose, claimDeadline, seedAmount)`
- `Funded(id, from, amount)`
- `Tipped(id, from, amount, note)`
- `WinnerSettled(id, to, amount, submissionHash, verdictHash, payoutNote)`: Bounty mode reservation
- `PrizeClaimed(id, to, amount)`: Bounty mode claim
- `UnclaimedReclaimed(id, winner, amount, organizer)`: Bounty mode sweep after deadline
- `TipPaid(id, to, amount, submissionHash, verdictHash, payoutNote)`: Tip mode instant payout
- `CampaignFinalized(id, refundedToOrganizer)`
- `MetadataUpdated(id, metadataURI)`
