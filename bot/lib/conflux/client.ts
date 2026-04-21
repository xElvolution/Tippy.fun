import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getChain } from './chain';

export function getPublicClient() {
  return createPublicClient({
    chain: getChain(),
    transport: http(),
  });
}

function normalizePk(hex: string): `0x${string}` {
  const t = hex.trim();
  return (t.startsWith('0x') ? t : `0x${t}`) as `0x${string}`;
}

export function getWalletClient(privateKeyHex: string) {
  const account = privateKeyToAccount(normalizePk(privateKeyHex));
  return createWalletClient({
    account,
    chain: getChain(),
    transport: http(),
  });
}
