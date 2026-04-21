import { formatUnits, isAddress } from 'viem';
import { getConfluxNetworkSlug } from './network';

type EtherscanLikeTx = {
  hash?: string;
  timeStamp?: string;
  from?: string;
  to?: string;
  value?: string;
  isError?: string;
};

type TxListResponse = {
  status?: string;
  message?: string;
  result?: EtherscanLikeTx[] | string;
};

function shortAddr(a: string): string {
  if (a.length <= 16) return a;
  return `${a.slice(0, 10)}…${a.slice(-6)}`;
}

/**
 * Incoming native CFX transfers via explorer API (Etherscan-compatible `txlist` when supported).
 * Returns [] if the indexer is unavailable or the address is invalid.
 */
export async function fetchCfxDepositsFromChain(
  address: string,
  excludeTxHashes: Set<string>,
  limit = 40,
): Promise<{ txHash: string; createdAt: string; amountHuman: string; fromAddress: string }[]> {
  if (!isAddress(address)) return [];

  const net = getConfluxNetworkSlug();
  const apiBase = net === 'mainnet' ? 'https://evm.confluxscan.org' : 'https://evmtestnet.confluxscan.org';
  const url = `${apiBase}/api?module=account&action=txlist&address=${encodeURIComponent(address)}&startblock=0&endblock=99999999&sort=desc`;

  let data: TxListResponse;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    data = (await res.json()) as TxListResponse;
  } catch {
    return [];
  }

  if (data.status !== '1' || !Array.isArray(data.result)) return [];

  const out: { txHash: string; createdAt: string; amountHuman: string; fromAddress: string }[] = [];

  for (const tx of data.result) {
    if (out.length >= limit) break;
    const hash = tx.hash;
    if (!hash || excludeTxHashes.has(hash)) continue;
    if (tx.isError === '1') continue;
    if (!tx.to || tx.to.toLowerCase() !== address.toLowerCase()) continue;
    if (!tx.value || tx.value === '0') continue;
    const ts = tx.timeStamp ? Number(tx.timeStamp) * 1000 : Date.now();
    let amountHuman: string;
    try {
      amountHuman = formatUnits(BigInt(tx.value), 18);
      const n = Number(amountHuman);
      if (Number.isFinite(n)) amountHuman = n.toLocaleString(undefined, { maximumFractionDigits: 18 });
    } catch {
      continue;
    }
    out.push({
      txHash: hash,
      createdAt: new Date(ts).toISOString(),
      amountHuman,
      fromAddress: tx.from ? shortAddr(tx.from) : 'External',
    });
  }

  return out;
}
