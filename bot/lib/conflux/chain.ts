import { defineChain, type Chain } from 'viem';
import { getConfluxNetworkSlug } from './network';

export const confluxESpaceTestnet = defineChain({
  id: 71,
  name: 'Conflux eSpace (Testnet)',
  nativeCurrency: { decimals: 18, name: 'CFX', symbol: 'CFX' },
  rpcUrls: {
    default: { http: ['https://evmtestnet.confluxrpc.com'] },
  },
  blockExplorers: {
    default: { name: 'Conflux Scan', url: 'https://evmtestnet.confluxscan.org' },
  },
});

export const confluxESpaceMainnet = defineChain({
  id: 1030,
  name: 'Conflux eSpace',
  nativeCurrency: { decimals: 18, name: 'CFX', symbol: 'CFX' },
  rpcUrls: {
    default: { http: ['https://evm.confluxrpc.com'] },
  },
  blockExplorers: {
    default: { name: 'Conflux Scan', url: 'https://evm.confluxscan.org' },
  },
});

export function getChain(): Chain {
  return getConfluxNetworkSlug() === 'mainnet' ? confluxESpaceMainnet : confluxESpaceTestnet;
}
