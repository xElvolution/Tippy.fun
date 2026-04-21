import { getConfluxNetworkSlug } from './network';

export function transactionExplorerUrl(txHash: string): string {
  const net = getConfluxNetworkSlug();
  const base = net === 'mainnet' ? 'https://evm.confluxscan.org' : 'https://evmtestnet.confluxscan.org';
  return `${base}/tx/${encodeURIComponent(txHash)}`;
}
