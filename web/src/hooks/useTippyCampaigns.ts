'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import {
  useReadContract,
  usePublicClient,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import {
  createPublicClient,
  createWalletClient,
  custom,
  keccak256,
  parseUnits,
  stringToBytes,
  type Address,
  type Hash,
} from 'viem';
import { tippyMakerAbi, erc20Abi } from '@/lib/tippyAbi';
import {
  getTippyAddress,
  requireTippyAddress,
  NATIVE_CFX,
  tokenByAddress,
  type SupportedToken,
} from '@/lib/contracts';
import { getActiveChain } from '@/lib/conflux';
import {
  encodeMetadataToDataUri,
  fetchCampaignMetadata,
  type CampaignMetadata,
} from '@/lib/campaignMetadata';

export type OnChainCampaign = {
  id: bigint;
  organizer: Address;
  token: Address;
  mode: number; // 0 Bounty, 1 Tip
  metadataURI: string;
  prizePool: bigint;
  totalFunded: bigint;
  totalTipped: bigint;
  totalPaidOut: bigint;
  totalEntitled: bigint;
  submissionsClose: bigint;
  claimDeadline: bigint;
  createdAt: bigint;
  finalized: boolean;
  latestVerdictHash: `0x${string}`;
  metadata?: CampaignMetadata | null;
  tokenInfo?: SupportedToken;
};

type RawCampaign = {
  organizer: Address;
  token: Address;
  mode: number;
  metadataURI: string;
  prizePool: bigint;
  totalFunded: bigint;
  totalTipped: bigint;
  totalPaidOut: bigint;
  totalEntitled: bigint;
  submissionsClose: bigint;
  claimDeadline: bigint;
  createdAt: bigint;
  finalized: boolean;
  latestVerdictHash: `0x${string}`;
};

function hydrate(id: bigint, raw: RawCampaign): OnChainCampaign {
  return { id, ...raw, tokenInfo: tokenByAddress(raw.token) };
}

export function useActiveWallet() {
  const { user, authenticated, ready, login } = usePrivy();
  const { wallets } = useWallets();
  const embedded = user?.wallet?.address;
  const wallet =
    wallets.find((w) => w.address.toLowerCase() === embedded?.toLowerCase()) ?? wallets[0];
  return {
    ready,
    authenticated,
    wallet,
    login,
    address: (wallet?.address as Address | undefined) ?? undefined,
  };
}

async function walletClientFor(wallet: ReturnType<typeof useActiveWallet>['wallet']) {
  if (!wallet) throw new Error('No wallet connected');
  const chain = getActiveChain();
  await wallet.switchChain(chain.id);
  const provider = await wallet.getEthereumProvider();
  return createWalletClient({
    account: wallet.address as Address,
    chain,
    transport: custom(provider),
  });
}

/** List recent campaigns (newest first) with metadata resolved. */
export function useRecentCampaigns(limit = 24) {
  const address = getTippyAddress();
  const chain = getActiveChain();
  const publicClient = usePublicClient({ chainId: chain.id });

  return useQuery({
    enabled: Boolean(address && publicClient),
    queryKey: ['tippy', 'recent', chain.id, address, limit],
    queryFn: async (): Promise<OnChainCampaign[]> => {
      if (!address || !publicClient) return [];
      const [page, ids] = (await publicClient.readContract({
        address,
        abi: tippyMakerAbi,
        functionName: 'getRecentCampaigns',
        args: [0n, BigInt(limit)],
      })) as [RawCampaign[], bigint[]];
      const base = page.map((raw, i) => hydrate(ids[i], raw));
      const enriched = await Promise.all(
        base.map(async (c) => ({ ...c, metadata: await fetchCampaignMetadata(c.metadataURI) })),
      );
      return enriched;
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useCampaign(id: bigint | number | undefined) {
  const address = getTippyAddress();
  const chain = getActiveChain();
  const idBig = typeof id === 'number' ? BigInt(id) : id;
  const read = useReadContract({
    address,
    abi: tippyMakerAbi,
    functionName: 'getCampaign',
    args: idBig !== undefined ? [idBig] : undefined,
    chainId: chain.id,
    query: { enabled: Boolean(address && idBig !== undefined) },
  });
  const metaQuery = useQuery({
    enabled: Boolean(read.data),
    queryKey: ['tippy', 'meta', (read.data as RawCampaign | undefined)?.metadataURI],
    queryFn: () => fetchCampaignMetadata((read.data as RawCampaign).metadataURI),
    staleTime: 60_000,
  });
  const campaign = useMemo<OnChainCampaign | undefined>(() => {
    if (!read.data || idBig === undefined) return undefined;
    return { ...hydrate(idBig, read.data as RawCampaign), metadata: metaQuery.data ?? null };
  }, [read.data, idBig, metaQuery.data]);
  return { ...read, campaign };
}

export function useEntitlement(id: bigint | number | undefined, winner?: Address) {
  const address = getTippyAddress();
  const chain = getActiveChain();
  const idBig = typeof id === 'number' ? BigInt(id) : id;
  return useReadContract({
    address,
    abi: tippyMakerAbi,
    functionName: 'entitlementOf',
    args: idBig !== undefined && winner ? [idBig, winner] : undefined,
    chainId: chain.id,
    query: { enabled: Boolean(address && idBig !== undefined && winner) },
  });
}

type TxState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; hash: Hash }
  | { status: 'error'; error: Error };

async function ensureAllowance(opts: {
  wallet: NonNullable<ReturnType<typeof useActiveWallet>['wallet']>;
  token: Address;
  owner: Address;
  spender: Address;
  amount: bigint;
}): Promise<Hash | null> {
  const { wallet, token, owner, spender, amount } = opts;
  const chain = getActiveChain();
  const provider = await wallet.getEthereumProvider();
  const publicRead = createPublicClient({ chain, transport: custom(provider) });
  const allowance = (await publicRead.readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  })) as bigint;
  if (allowance >= amount) return null;
  const client = await walletClientFor(wallet);
  return await client.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, amount],
  });
}

export function useCreateCampaign() {
  const { wallet, authenticated, login } = useActiveWallet();
  const [state, setState] = useState<TxState>({ status: 'idle' });
  const receipt = useWaitForTransactionReceipt({
    hash: state.status === 'success' ? state.hash : undefined,
  });

  const create = useCallback(
    async (input: {
      metadata: CampaignMetadata;
      mode: 0 | 1;
      token: SupportedToken;
      submissionsClose?: number; // unix seconds, 0 = none
      claimDeadline?: number; // unix seconds, required for Bounty mode
      seedAmount?: string; // human-readable
    }): Promise<Hash> => {
      if (!authenticated || !wallet) {
        await login();
        throw new Error('Please finish connecting your wallet, then try again.');
      }
      const addr = requireTippyAddress();
      const client = await walletClientFor(wallet);
      const uri = encodeMetadataToDataUri(input.metadata);
      const seed =
        input.seedAmount && Number(input.seedAmount) > 0
          ? parseUnits(input.seedAmount, input.token.decimals)
          : 0n;

      setState({ status: 'pending' });
      try {
        if (!input.token.isNative && seed > 0n) {
          await ensureAllowance({
            wallet,
            token: input.token.address,
            owner: wallet.address as Address,
            spender: addr,
            amount: seed,
          });
        }
        const hash = await client.writeContract({
          address: addr,
          abi: tippyMakerAbi,
          functionName: 'createCampaign',
          args: [
            input.token.address,
            input.mode,
            uri,
            BigInt(input.submissionsClose ?? 0),
            BigInt(input.claimDeadline ?? 0),
            seed,
          ],
          value: input.token.isNative ? seed : 0n,
        });
        setState({ status: 'success', hash });
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create campaign');
        setState({ status: 'error', error });
        throw error;
      }
    },
    [wallet, authenticated, login],
  );

  return { create, state, receipt };
}

export function useTipCampaign() {
  const { wallet, authenticated, login } = useActiveWallet();
  const [state, setState] = useState<TxState>({ status: 'idle' });
  const receipt = useWaitForTransactionReceipt({
    hash: state.status === 'success' ? state.hash : undefined,
  });

  const tip = useCallback(
    async (input: {
      id: bigint | number;
      token: SupportedToken;
      amount: string;
      note?: string;
    }) => {
      if (!authenticated || !wallet) {
        await login();
        throw new Error('Please finish connecting your wallet, then try again.');
      }
      const addr = requireTippyAddress();
      const client = await walletClientFor(wallet);
      const value = parseUnits(input.amount, input.token.decimals);
      setState({ status: 'pending' });
      try {
        if (!input.token.isNative) {
          await ensureAllowance({
            wallet,
            token: input.token.address,
            owner: wallet.address as Address,
            spender: addr,
            amount: value,
          });
        }
        const hash = await client.writeContract({
          address: addr,
          abi: tippyMakerAbi,
          functionName: 'tip',
          args: [BigInt(input.id), value, input.note ?? ''],
          value: input.token.isNative ? value : 0n,
        });
        setState({ status: 'success', hash });
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to tip');
        setState({ status: 'error', error });
        throw error;
      }
    },
    [wallet, authenticated, login],
  );

  return { tip, state, receipt };
}

export function useFundCampaign() {
  const { wallet, authenticated, login } = useActiveWallet();
  const [state, setState] = useState<TxState>({ status: 'idle' });

  const fund = useCallback(
    async (input: { id: bigint | number; token: SupportedToken; amount: string }) => {
      if (!authenticated || !wallet) {
        await login();
        throw new Error('Please finish connecting your wallet, then try again.');
      }
      const addr = requireTippyAddress();
      const client = await walletClientFor(wallet);
      const value = parseUnits(input.amount, input.token.decimals);
      setState({ status: 'pending' });
      try {
        if (!input.token.isNative) {
          await ensureAllowance({
            wallet,
            token: input.token.address,
            owner: wallet.address as Address,
            spender: addr,
            amount: value,
          });
        }
        const hash = await client.writeContract({
          address: addr,
          abi: tippyMakerAbi,
          functionName: 'fund',
          args: [BigInt(input.id), value],
          value: input.token.isNative ? value : 0n,
        });
        setState({ status: 'success', hash });
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fund');
        setState({ status: 'error', error });
        throw error;
      }
    },
    [wallet, authenticated, login],
  );

  return { fund, state };
}

export function useSettleWinners() {
  const { wallet, authenticated, login } = useActiveWallet();
  const [state, setState] = useState<TxState>({ status: 'idle' });

  const settle = useCallback(
    async (input: {
      id: bigint | number;
      winners: Array<{ address: Address; amount: string; submissionId: string }>;
      token: SupportedToken;
      verdictHash: `0x${string}`;
      payoutNote?: string;
    }) => {
      if (!authenticated || !wallet) {
        await login();
        throw new Error('Please finish connecting your wallet, then try again.');
      }
      const addr = requireTippyAddress();
      const client = await walletClientFor(wallet);
      setState({ status: 'pending' });
      try {
        const hash = await client.writeContract({
          address: addr,
          abi: tippyMakerAbi,
          functionName: 'settleWinners',
          args: [
            BigInt(input.id),
            input.winners.map((w) => w.address),
            input.winners.map((w) => parseUnits(w.amount, input.token.decimals)),
            input.winners.map((w) => keccak256(stringToBytes(w.submissionId))),
            input.verdictHash,
            input.payoutNote ?? '',
          ],
        });
        setState({ status: 'success', hash });
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to settle winners');
        setState({ status: 'error', error });
        throw error;
      }
    },
    [wallet, authenticated, login],
  );

  return { settle, state };
}

export function useClaimPrize() {
  const { wallet, authenticated, login } = useActiveWallet();
  const [state, setState] = useState<TxState>({ status: 'idle' });

  const claim = useCallback(
    async (id: bigint | number) => {
      if (!authenticated || !wallet) {
        await login();
        throw new Error('Please finish connecting your wallet, then try again.');
      }
      const addr = requireTippyAddress();
      const client = await walletClientFor(wallet);
      setState({ status: 'pending' });
      try {
        const hash = await client.writeContract({
          address: addr,
          abi: tippyMakerAbi,
          functionName: 'claim',
          args: [BigInt(id)],
        });
        setState({ status: 'success', hash });
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to claim');
        setState({ status: 'error', error });
        throw error;
      }
    },
    [wallet, authenticated, login],
  );

  return { claim, state };
}

export function useReclaimUnclaimed() {
  const { wallet, authenticated, login } = useActiveWallet();
  const [state, setState] = useState<TxState>({ status: 'idle' });

  const reclaim = useCallback(
    async (input: { id: bigint | number; winners: Address[] }) => {
      if (!authenticated || !wallet) {
        await login();
        throw new Error('Please finish connecting your wallet, then try again.');
      }
      const addr = requireTippyAddress();
      const client = await walletClientFor(wallet);
      setState({ status: 'pending' });
      try {
        const hash = await client.writeContract({
          address: addr,
          abi: tippyMakerAbi,
          functionName: 'reclaimUnclaimed',
          args: [BigInt(input.id), input.winners],
        });
        setState({ status: 'success', hash });
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to reclaim');
        setState({ status: 'error', error });
        throw error;
      }
    },
    [wallet, authenticated, login],
  );

  return { reclaim, state };
}

export function usePayTip() {
  const { wallet, authenticated, login } = useActiveWallet();
  const [state, setState] = useState<TxState>({ status: 'idle' });

  const pay = useCallback(
    async (input: {
      id: bigint | number;
      to: Address;
      amount: string;
      token: SupportedToken;
      submissionId: string;
      verdictHash: `0x${string}`;
      payoutNote?: string;
    }) => {
      if (!authenticated || !wallet) {
        await login();
        throw new Error('Please finish connecting your wallet, then try again.');
      }
      const addr = requireTippyAddress();
      const client = await walletClientFor(wallet);
      const submissionHash = keccak256(stringToBytes(input.submissionId));
      setState({ status: 'pending' });
      try {
        const hash = await client.writeContract({
          address: addr,
          abi: tippyMakerAbi,
          functionName: 'payTip',
          args: [
            BigInt(input.id),
            input.to,
            parseUnits(input.amount, input.token.decimals),
            submissionHash,
            input.verdictHash,
            input.payoutNote ?? '',
          ],
        });
        setState({ status: 'success', hash });
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to pay tip');
        setState({ status: 'error', error });
        throw error;
      }
    },
    [wallet, authenticated, login],
  );

  return { pay, state };
}

/** Backward-compat alias for older UI. Uses Bounty-mode settle for a single winner. */
export function usePayWinner() {
  const settle = useSettleWinners();
  const pay = useCallback(
    async (input: {
      id: bigint | number;
      to: Address;
      amount: string;
      token: SupportedToken;
      submissionId: string;
      verdictHash?: `0x${string}`;
      payoutNote?: string;
    }) => {
      return settle.settle({
        id: input.id,
        token: input.token,
        winners: [
          { address: input.to, amount: input.amount, submissionId: input.submissionId },
        ],
        verdictHash: (input.verdictHash ?? `0x${'0'.repeat(64)}`) as `0x${string}`,
        payoutNote: input.payoutNote,
      });
    },
    [settle],
  );
  return { pay, state: settle.state };
}

/** Live event log for a campaign. */
export function useCampaignLedger(id: bigint | number | undefined) {
  const address = getTippyAddress();
  const chain = getActiveChain();
  const publicClient = usePublicClient({ chainId: chain.id });
  const idBig = typeof id === 'number' ? BigInt(id) : id;

  return useQuery({
    enabled: Boolean(address && publicClient && idBig !== undefined),
    queryKey: ['tippy', 'ledger', chain.id, address, idBig?.toString()],
    queryFn: async () => {
      if (!address || !publicClient || idBig === undefined) return [];
      const events = [
        'CampaignCreated',
        'Funded',
        'Tipped',
        'WinnerSettled',
        'PrizeClaimed',
        'UnclaimedReclaimed',
        'TipPaid',
        'CampaignFinalized',
      ] as const;
      const results = await Promise.all(
        events.map((name) =>
          publicClient.getContractEvents({
            address,
            abi: tippyMakerAbi,
            eventName: name,
            args: { id: idBig } as never,
            fromBlock: 'earliest',
            toBlock: 'latest',
          }),
        ),
      );
      const merged = results.flat().sort((a, b) => {
        if (a.blockNumber !== b.blockNumber)
          return Number(a.blockNumber - b.blockNumber);
        return (a.logIndex ?? 0) - (b.logIndex ?? 0);
      });
      return merged;
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export { NATIVE_CFX };
