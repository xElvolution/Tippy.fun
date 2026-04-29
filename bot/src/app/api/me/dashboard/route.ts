import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isSupabaseConfigured } from '@lib/env';
import { getUserByDiscordId } from '@lib/db/users';
import { listRecentTipsForDashboard } from '@lib/db/tips';
import { listPointBalancesForUser } from '@lib/db/points';
import { fetchCfxBalanceHuman } from '@lib/conflux/balance';
import { fetchErc20BalanceHuman, fetchOptionalTestErc20BalanceHuman } from '@lib/conflux/erc20';
import { listDashboardTokensForUser } from '@lib/db/dashboardTokens';
import { fetchCfxDepositsFromChain } from '@lib/conflux/deposits';
import { getConfluxNetworkSlug } from '@lib/conflux/network';
import { isAddress } from 'viem';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({
        registered: false,
        network: getConfluxNetworkSlug(),
        evmAddress: null,
        cfxBalance: null,
        testErc20Balance: null,
        customTokens: [] as { id: string; label: string; tokenType: string; balance: string }[],
        otherTokenCount: 0,
        points: [] as { symbol: string; balance: string }[],
        tips: [],
        depositPreviews: [],
      });
    }

    // Legacy row guard: old installs can still hold non-eSpace addresses
    // (e.g. `inj...`). Conflux EVM RPC requires `0x...`.
    if (!isAddress(user.evm_address)) {
      return NextResponse.json({
        registered: false,
        network: getConfluxNetworkSlug(),
        evmAddress: null,
        cfxBalance: null,
        testErc20Balance: null,
        customTokens: [] as { id: string; label: string; tokenType: string; balance: string }[],
        otherTokenCount: 0,
        points: [] as { symbol: string; balance: string }[],
        tips: [],
        depositPreviews: [],
      });
    }

    const [cfxBalance, testErc20Balance, points, tips] = await Promise.all([
      fetchCfxBalanceHuman(user.evm_address),
      fetchOptionalTestErc20BalanceHuman(user.evm_address),
      listPointBalancesForUser(user.id),
      listRecentTipsForDashboard(user.id, 24),
    ]);

    let tokenRows: Awaited<ReturnType<typeof listDashboardTokensForUser>> = [];
    try {
      tokenRows = await listDashboardTokensForUser(user.id);
    } catch {
      tokenRows = [];
    }

    const customTokens = await Promise.all(
      tokenRows.map(async (t) => {
        const balance =
          t.token_type === 'bank' ? '0'
          : await fetchErc20BalanceHuman(user.evm_address, t.ref, t.decimals);
        return {
          id: t.id,
          label: t.label,
          tokenType: t.token_type,
          balance,
        };
      }),
    );

    const knownTipTx = new Set(tips.map((t) => t.txHash).filter(Boolean) as string[]);
    const depositPreviews = await fetchCfxDepositsFromChain(user.evm_address, knownTipTx, 24);

    return NextResponse.json({
      registered: true,
      network: getConfluxNetworkSlug(),
      evmAddress: user.evm_address,
      cfxBalance,
      testErc20Balance,
      customTokens,
      otherTokenCount: 0,
      points,
      tips,
      depositPreviews,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Dashboard load failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
