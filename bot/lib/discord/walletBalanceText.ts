import { fetchCfxBalanceHuman } from '../conflux/balance';
import { fetchOptionalTestErc20BalanceHuman, fetchErc20BalanceHuman } from '../conflux/erc20';
import { listDashboardTokensForUser } from '../db/dashboardTokens';
import { listPointBalancesForUser } from '../db/points';

function formatPointsBalance(raw: string): string {
  try {
    const n = BigInt(raw);
    if (n >= 1000n) return `${(Number(n) / 1000).toFixed(1)}k`;
    return n.toString();
  } catch {
    return raw;
  }
}

const MAX_CHARS = 3800;

/** Full wallet summary for Discord `/balance` (matches web dashboard sources). */
export async function buildDiscordWalletBalanceText(params: {
  evmAddress: string;
  userId: string;
}): Promise<string> {
  const addr = params.evmAddress;

  const [cfx, testErc20] = await Promise.all([
    fetchCfxBalanceHuman(addr),
    fetchOptionalTestErc20BalanceHuman(addr),
  ]);

  let dashTokens: Awaited<ReturnType<typeof listDashboardTokensForUser>> = [];
  try {
    dashTokens = await listDashboardTokensForUser(params.userId);
  } catch {
    dashTokens = [];
  }

  const customLines: string[] = [];
  for (const t of dashTokens) {
    if (t.token_type === 'bank') {
      customLines.push(`• **${t.label}** (bank / legacy): _not shown on Conflux eSpace_`);
      continue;
    }
    const bal = await fetchErc20BalanceHuman(addr, t.ref, t.decimals);
    customLines.push(`• **${t.label}** (ERC-20): ${bal}`);
  }

  const points = await listPointBalancesForUser(params.userId);
  const pointLines = points.map((p) => `• **${p.symbol}:** ${formatPointsBalance(p.balance)}`);

  const lines: string[] = [];
  lines.push(`**Address:** \`${addr}\``);
  lines.push('');
  lines.push('**On-chain (known)**');
  lines.push(`• **CFX:** ${cfx}`);
  lines.push(`• **Test ERC-20** _(if configured)_: ${testErc20}`);

  if (customLines.length > 0) {
    lines.push('');
    lines.push('**Your watchlist** _(web dashboard)_');
    lines.push(...customLines);
  }

  lines.push('');
  lines.push('**Project points**');
  if (pointLines.length === 0) {
    lines.push('• _No balances (minted points appear here)._');
  } else {
    lines.push(...pointLines);
  }

  let out = lines.join('\n');
  if (out.length > MAX_CHARS) {
    out = `${out.slice(0, MAX_CHARS - 40)}\n\n_…truncated. Open the web dashboard for the full holdings panel._`;
  }
  return out;
}
