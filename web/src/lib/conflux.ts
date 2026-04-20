import { defineChain } from 'viem';

export const confluxEspace = defineChain({
  id: 1030,
  name: 'Conflux eSpace',
  nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_CONFLUX_ESPACE_RPC || 'https://evm.confluxrpc.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'ConfluxScan',
      url: 'https://evm.confluxscan.io',
      apiUrl: 'https://evmapi.confluxscan.io/api',
    },
  },
  testnet: false,
});

export const confluxEspaceTestnet = defineChain({
  id: 71,
  name: 'Conflux eSpace Testnet',
  nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_CONFLUX_ESPACE_TESTNET_RPC ||
          'https://evmtestnet.confluxrpc.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'ConfluxScan Testnet',
      url: 'https://evmtestnet.confluxscan.io',
      apiUrl: 'https://evmapi-testnet.confluxscan.io/api',
    },
  },
  testnet: true,
});

export type ConfluxTarget = 'mainnet' | 'testnet';

export function resolveConfluxTarget(): ConfluxTarget {
  const raw = (process.env.NEXT_PUBLIC_CONFLUX_CHAIN || 'testnet').toLowerCase();
  return raw === 'mainnet' ? 'mainnet' : 'testnet';
}

export function getActiveChain() {
  return resolveConfluxTarget() === 'mainnet' ? confluxEspace : confluxEspaceTestnet;
}

export function explorerTxUrl(hash: string): string {
  const chain = getActiveChain();
  return `${chain.blockExplorers.default.url}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  const chain = getActiveChain();
  return `${chain.blockExplorers.default.url}/address/${address}`;
}

export function shortAddress(address?: string | null, size = 4): string {
  if (!address) return '';
  return `${address.slice(0, 2 + size)}…${address.slice(-size)}`;
}
