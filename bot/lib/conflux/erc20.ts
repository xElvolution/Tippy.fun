import { formatUnits } from 'viem';
import { readContract } from 'viem/actions';
import { getPublicClient } from './client';
import { erc20Abi } from './erc20Abi';
import { formatTokenHumanFromRaw } from './formatBalance';

/** Optional dashboard token (e.g. test USDT); set `TEST_ERC20_CONTRACT` (0x…). */
export function optionalTestErc20Address(): string | null {
  const raw = process.env.TEST_ERC20_CONTRACT?.trim();
  if (raw === '') return null;
  return raw || null;
}

export function testErc20Decimals(): number {
  const d = Number(process.env.TEST_ERC20_DECIMALS ?? '6');
  return Number.isFinite(d) && d >= 0 && d <= 36 ? d : 6;
}

export async function fetchErc20BalanceHuman(
  holderAddress: string,
  contractAddress: string,
  decimals: number,
): Promise<string> {
  const client = getPublicClient();
  try {
    const raw = await readContract(client, {
      address: contractAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [holderAddress as `0x${string}`],
    });
    return formatTokenHumanFromRaw(raw, decimals);
  } catch {
    return '0';
  }
}

export async function fetchOptionalTestErc20BalanceHuman(holderAddress: string): Promise<string> {
  const c = optionalTestErc20Address();
  if (!c) return '0';
  return fetchErc20BalanceHuman(holderAddress, c, testErc20Decimals());
}
