import { NextRequest } from 'next/server';
import { createPublicClient, http, type Address } from 'viem';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { tippyMakerAbi } from '@/lib/tippyAbi';
import { getActiveChain } from '@/lib/conflux';
import { getTippyAddress } from '@/lib/contracts';
import { fetchCampaignMetadata } from '@/lib/campaignMetadata';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function unixToIso(sec: bigint): string | null {
  if (sec === 0n) return null;
  const ms = Number(sec) * 1000;
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

/**
 * Minimal indexer. Reads contract events since the last indexed block, upserts them into the
 * Supabase cache tables, and bumps the cursor. Safe to call repeatedly – idempotent thanks to
 * primary keys on `tips_cache` / `payouts_cache` and upsert on `campaigns_cache`.
 *
 * Auth: if `INDEXER_SECRET` is set, the request must include `?secret=<value>` matching it.
 * Public GETs are allowed when the secret is not configured, which is fine for a hackathon demo.
 */
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: 'Supabase is not configured.' }, { status: 501 });
  }
  const expected = process.env.INDEXER_SECRET;
  if (expected) {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('secret') !== expected) {
      return Response.json({ error: 'unauthorized' }, { status: 401 });
    }
  }
  const address = getTippyAddress();
  if (!address) {
    return Response.json(
      { error: 'TippyMaker contract address is not configured.' },
      { status: 501 },
    );
  }

  const chain = getActiveChain();
  const publicClient = createPublicClient({ chain, transport: http() });
  const latestBlock = await publicClient.getBlockNumber();

  const db = supabaseAdmin();
  const { data: cursorRow } = await db
    .from('indexer_cursor')
    .select('last_block')
    .eq('chain_id', chain.id)
    .maybeSingle();
  const startFromEnv = Number(process.env.INDEXER_START_BLOCK ?? '0');
  const fromBlock =
    cursorRow?.last_block !== undefined ? BigInt(cursorRow.last_block) + 1n : BigInt(startFromEnv);

  if (fromBlock > latestBlock) {
    return Response.json({ scannedBlocks: 0, latestBlock: Number(latestBlock) });
  }

  const EVENT_NAMES = [
    'CampaignCreated',
    'Funded',
    'Tipped',
    'WinnerSettled',
    'PrizeClaimed',
    'UnclaimedReclaimed',
    'TipPaid',
    'CampaignFinalized',
    'MetadataUpdated',
  ] as const;

  // Fetch all events in one scan range.
  const events = await Promise.all(
    EVENT_NAMES.map((name) =>
      publicClient.getContractEvents({
        address,
        abi: tippyMakerAbi,
        eventName: name,
        fromBlock,
        toBlock: latestBlock,
      }),
    ),
  );
  const flat = events.flat();

  // Track which campaigns need their full snapshot refreshed.
  const campaignsToRefresh = new Set<string>();

  for (const ev of flat) {
    const campaignId = (ev.args as { id?: bigint }).id;
    if (campaignId === undefined) continue;
    campaignsToRefresh.add(campaignId.toString());

    const common = {
      chain_id: chain.id,
      campaign_id: campaignId.toString(),
      log_index: ev.logIndex ?? 0,
      block_number: ev.blockNumber?.toString() ?? '0',
      tx_hash: ev.transactionHash ?? '',
    };

    switch (ev.eventName) {
      case 'Funded': {
        const a = ev.args as { from: string; amount: bigint };
        await db.from('tips_cache').upsert({
          ...common,
          from_address: a.from.toLowerCase(),
          amount: a.amount.toString(),
          note: null,
          kind: 'fund',
        });
        break;
      }
      case 'Tipped': {
        const a = ev.args as { from: string; amount: bigint; note: string };
        await db.from('tips_cache').upsert({
          ...common,
          from_address: a.from.toLowerCase(),
          amount: a.amount.toString(),
          note: a.note,
          kind: 'tip',
        });
        break;
      }
      case 'WinnerSettled': {
        const a = ev.args as {
          to: string;
          amount: bigint;
          submissionHash: string;
          verdictHash: string;
          payoutNote: string;
        };
        await db.from('payouts_cache').upsert({
          ...common,
          kind: 'settled',
          to_address: a.to.toLowerCase(),
          amount: a.amount.toString(),
          submission_hash: a.submissionHash,
          verdict_hash: a.verdictHash,
          note: a.payoutNote,
        });
        break;
      }
      case 'PrizeClaimed': {
        const a = ev.args as { to: string; amount: bigint };
        await db.from('payouts_cache').upsert({
          ...common,
          kind: 'claimed',
          to_address: a.to.toLowerCase(),
          amount: a.amount.toString(),
        });
        break;
      }
      case 'UnclaimedReclaimed': {
        const a = ev.args as { winner: string; amount: bigint; organizer: string };
        await db.from('payouts_cache').upsert({
          ...common,
          kind: 'reclaimed',
          to_address: a.winner.toLowerCase(),
          amount: a.amount.toString(),
          note: `reclaimed to ${a.organizer}`,
        });
        break;
      }
      case 'TipPaid': {
        const a = ev.args as {
          to: string;
          amount: bigint;
          submissionHash: string;
          verdictHash: string;
          payoutNote: string;
        };
        await db.from('payouts_cache').upsert({
          ...common,
          kind: 'tip_paid',
          to_address: a.to.toLowerCase(),
          amount: a.amount.toString(),
          submission_hash: a.submissionHash,
          verdict_hash: a.verdictHash,
          note: a.payoutNote,
        });
        break;
      }
      default:
        break;
    }
  }

  // Refresh each touched campaign via a single getCampaign call.
  for (const idStr of campaignsToRefresh) {
    try {
      const raw = (await publicClient.readContract({
        address,
        abi: tippyMakerAbi,
        functionName: 'getCampaign',
        args: [BigInt(idStr)],
      })) as {
        organizer: Address;
        token: Address;
        mode: number;
        metadataURI: string;
        prizePool: bigint;
        totalFunded: bigint;
        totalTipped: bigint;
        totalPaidOut: bigint;
        totalEntitled: bigint;
        submissionsClose: bigint;
        claimDeadline: bigint;
        createdAt: bigint;
        finalized: boolean;
        latestVerdictHash: string;
      };
      const metadata = await fetchCampaignMetadata(raw.metadataURI);
      await db.from('campaigns_cache').upsert({
        chain_id: chain.id,
        campaign_id: idStr,
        organizer: raw.organizer.toLowerCase(),
        token: raw.token.toLowerCase(),
        mode: Number(raw.mode),
        metadata_uri: raw.metadataURI,
        metadata: metadata ?? null,
        prize_pool: raw.prizePool.toString(),
        total_funded: raw.totalFunded.toString(),
        total_tipped: raw.totalTipped.toString(),
        total_paid_out: raw.totalPaidOut.toString(),
        total_entitled: raw.totalEntitled.toString(),
        submissions_close: unixToIso(raw.submissionsClose),
        claim_deadline: unixToIso(raw.claimDeadline),
        created_at: unixToIso(raw.createdAt) ?? new Date().toISOString(),
        finalized: raw.finalized,
        latest_verdict_hash: raw.latestVerdictHash,
        last_indexed_block: Number(latestBlock),
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn(`indexer: failed to refresh campaign ${idStr}:`, err);
    }
  }

  await db.from('indexer_cursor').upsert({
    chain_id: chain.id,
    last_block: Number(latestBlock),
    updated_at: new Date().toISOString(),
  });

  return Response.json({
    scannedBlocks: Number(latestBlock - fromBlock + 1n),
    latestBlock: Number(latestBlock),
    eventsIndexed: flat.length,
    campaignsRefreshed: campaignsToRefresh.size,
  });
}
