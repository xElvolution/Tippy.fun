export type ConfluxNetworkSlug = 'mainnet' | 'testnet';

export function getConfluxNetworkSlug(): ConfluxNetworkSlug {
  const n = (process.env.CONFLUX_NETWORK ?? process.env.NEXT_PUBLIC_CONFLUX_NETWORK ?? 'testnet').toLowerCase();
  return n === 'mainnet' ? 'mainnet' : 'testnet';
}
