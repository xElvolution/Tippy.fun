import { getActiveChain } from './conflux';
import { tippyMakerAbi, erc20Abi } from './tippyAbi';
import type { Address } from 'viem';

export const NATIVE_CFX: Address = '0x0000000000000000000000000000000000000000';

export type CampaignMode = 0 | 1; // 0 = Bounty, 1 = Tip
export const MODE_BOUNTY: CampaignMode = 0;
export const MODE_TIP: CampaignMode = 1;

export function getTippyAddress(): Address | undefined {
  const raw = process.env.NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS?.trim();
  if (!raw) return undefined;
  if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw as Address;
}

export function requireTippyAddress(): Address {
  const addr = getTippyAddress();
  if (!addr) {
    throw new Error(
      'TippyMaker contract address is not configured. Set NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS in web/.env.local.',
    );
  }
  return addr;
}

export type SupportedToken = {
  key: 'CFX' | 'USDT0' | 'AxCNH';
  label: string;
  address: Address;
  decimals: number;
  isNative: boolean;
  hint?: string;
};

function envAddress(key: string): Address | undefined {
  const raw = process.env[key]?.trim();
  if (!raw) return undefined;
  if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw as Address;
}

/**
 * The tokens Tippy accepts for prize pools. CFX is always available; USDT0/AxCNH appear only
 * when the corresponding `NEXT_PUBLIC_*_ADDRESS` env var is set (mainnet real token, testnet mock).
 */
export function supportedTokens(): SupportedToken[] {
  const list: SupportedToken[] = [
    {
      key: 'CFX',
      label: 'CFX (native)',
      address: NATIVE_CFX,
      decimals: 18,
      isNative: true,
      hint: 'Conflux eSpace native token',
    },
  ];
  const usdt = envAddress('NEXT_PUBLIC_USDT0_ADDRESS');
  if (usdt) {
    list.push({
      key: 'USDT0',
      label: 'USDT0',
      address: usdt,
      decimals: 6,
      isNative: false,
      hint: 'Stablecoin for fiat-denominated prize pools',
    });
  }
  const axcnh = envAddress('NEXT_PUBLIC_AXCNH_ADDRESS');
  if (axcnh) {
    list.push({
      key: 'AxCNH',
      label: 'AxCNH',
      address: axcnh,
      decimals: 18,
      isNative: false,
      hint: 'AnySwap-wrapped Chinese Yuan for regional campaigns',
    });
  }
  return list;
}

export function tokenByAddress(address: Address | undefined): SupportedToken | undefined {
  if (!address) return undefined;
  const want = address.toLowerCase();
  return supportedTokens().find((t) => t.address.toLowerCase() === want);
}

export const tippyContractConfig = () => {
  const address = getTippyAddress();
  const chain = getActiveChain();
  return {
    address,
    abi: tippyMakerAbi,
    chainId: chain.id,
  } as const;
};

export { tippyMakerAbi, erc20Abi };
