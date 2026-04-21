import { formatUnits } from 'viem';
import { getPublicClient } from './client';

export async function fetchCfxBalanceHuman(address: string): Promise<string> {
  const client = getPublicClient();
  const bal = await client.getBalance({ address: address as `0x${string}` });
  const s = formatUnits(bal, 18);
  const n = Number(s);
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 6 }) : s;
}
