import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isSupabaseConfigured } from '@lib/env';
import { getUserByDiscordId } from '@lib/db/users';
import { listRecentTipsForDashboard } from '@lib/db/tips';
import { listWithdrawalsForUser } from '@lib/db/withdrawals';
import { transactionExplorerUrl } from '@lib/conflux/explorer';
import { fetchCfxDepositsFromChain } from '@lib/conflux/deposits';
import type { ActivityItemJson } from '@/types/activity';

export const dynamic = 'force-dynamic';

function tipDenomToAsset(denom: string): string {
  const d = denom.toLowerCase();
  if (d === 'cfx' || d === 'inj') return 'CFX';
  if (d.startsWith('erc20:')) return 'ERC-20';
  if (d.startsWith('cw20:')) return 'ERC-20';
  return denom.toUpperCase();
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  const discordId = session?.user?.id;
  if (!discordId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await getUserByDiscordId(discordId);
    if (!user) {
      return NextResponse.json({ registered: false, items: [] as ActivityItemJson[] });
    }

    const [tips, withdrawals] = await Promise.all([
      listRecentTipsForDashboard(user.id, 200),
      listWithdrawalsForUser(user.id, 200),
    ]);

    const knownTx = new Set<string>();
    for (const t of tips) {
      if (t.txHash) knownTx.add(t.txHash);
    }
    for (const w of withdrawals) {
      if (w.tx_hash) knownTx.add(w.tx_hash);
    }

    const chainDeposits = await fetchCfxDepositsFromChain(user.evm_address, knownTx, 60);

    const tipItems: ActivityItemJson[] = tips.map((t) => {
      const asset = tipDenomToAsset(t.denom);
      const sign = t.direction === 'sent' ? '-' : '+';
      const st = t.status.toUpperCase();
      let status = 'PROCESSING';
      if (st === 'SUCCESS') status = 'COMPLETED';
      else if (st === 'FAILED') status = 'FAILED';
      return {
        id: `tip-${t.id}`,
        kind: t.direction === 'sent' ? 'tip_sent' : 'tip_received',
        createdAt: t.createdAt,
        typeLabel: t.direction === 'sent' ? 'Tip sent' : 'Tip received',
        asset,
        assetRail: 'CFX',
        amountPrimary: `${sign} ${t.amount} ${asset}`,
        amountSecondary: 'Recorded in Tippy',
        counterparty: t.counterpartyUsername,
        txHash: t.txHash,
        explorerUrl: t.txHash ? transactionExplorerUrl(t.txHash) : null,
        status,
      };
    });

    const wItems: ActivityItemJson[] = withdrawals.map((w) => {
      const asset = w.denom.toLowerCase() === 'cfx' || w.denom.toLowerCase() === 'inj' ? 'CFX' : w.denom.toUpperCase();
      const st = w.status.toLowerCase();
      let status = 'PROCESSING';
      if (st === 'success') status = 'COMPLETED';
      else if (st === 'failed') status = 'FAILED';
      const shortTo =
        w.to_address.length > 16 ? `${w.to_address.slice(0, 8)}…${w.to_address.slice(-6)}` : w.to_address;
      return {
        id: `wd-${w.id}`,
        kind: 'withdrawal' as const,
        createdAt: w.created_at,
        typeLabel: 'Withdrawal',
        asset,
        assetRail: 'CFX',
        amountPrimary: `- ${w.amount} ${asset}`,
        amountSecondary: `To ${shortTo}`,
        counterparty: shortTo,
        txHash: w.tx_hash,
        explorerUrl: w.tx_hash ? transactionExplorerUrl(w.tx_hash) : null,
        status,
      };
    });

    const depItems: ActivityItemJson[] = chainDeposits.map((d) => ({
      id: `dep-${d.txHash}`,
      kind: 'deposit' as const,
      createdAt: d.createdAt,
      typeLabel: 'Deposit',
      asset: 'CFX',
      assetRail: 'CFX',
      amountPrimary: `+ ${d.amountHuman} CFX`,
      amountSecondary: 'Incoming on-chain',
      counterparty: d.fromAddress,
      txHash: d.txHash,
      explorerUrl: transactionExplorerUrl(d.txHash),
      status: 'COMPLETED',
    }));

    const items = [...tipItems, ...wItems, ...depItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({ registered: true, items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Activity load failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
