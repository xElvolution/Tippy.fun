'use client';

import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import {
  useActiveWallet,
  useCampaign,
  useClaimPrize,
  useEntitlement,
} from '@/hooks/useTippyCampaigns';
import { explorerTxUrl, getActiveChain } from '@/lib/conflux';
import { getTippyAddress, MODE_BOUNTY } from '@/lib/contracts';

type Props = { campaignId: string | number };

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0s';
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export function ClaimCard({ campaignId }: Props) {
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const id = BigInt(campaignId);
  const { address, authenticated, login } = useActiveWallet();
  const { campaign } = useCampaign(id);
  const { data, refetch } = useEntitlement(id, address);
  const { claim, state } = useClaimPrize();

  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const i = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1_000);
    return () => clearInterval(i);
  }, []);

  if (!configured) return null;
  if (!campaign || Number(campaign.mode) !== MODE_BOUNTY) return null;

  const claimDeadline = Number(campaign.claimDeadline);
  const secondsLeft = claimDeadline - now;
  const deadlinePassed = secondsLeft <= 0;
  const [amount, claimed] = (data as [bigint, boolean] | undefined) ?? [0n, false];

  const token = campaign.tokenInfo;
  const symbol = token?.key ?? chain.nativeCurrency.symbol;
  const decimals = token?.decimals ?? 18;
  const busy = state.status === 'pending';
  const txHash = state.status === 'success' ? state.hash : null;

  if (!authenticated || !address) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm">
        <p className="font-bold text-on-surface mb-1">Won something?</p>
        <p className="text-on-surface-variant mb-3">
          Connect the wallet used to submit to check for a claimable prize.
        </p>
        <button
          type="button"
          onClick={() => login()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:opacity-90"
        >
          Connect wallet
        </button>
      </div>
    );
  }

  if (amount === 0n && !claimed) {
    return (
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 text-sm">
        <p className="font-bold text-on-surface mb-1">No prize to claim</p>
        <p className="text-on-surface-variant">
          The connected wallet has no reserved prize on campaign #{campaign.id.toString()} yet.
        </p>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="rounded-2xl border border-tertiary/30 bg-tertiary-container/40 p-5 text-sm">
        <p className="font-bold text-on-tertiary-container mb-1">Prize claimed</p>
        <p className="text-on-surface-variant">
          You have already claimed this prize. Congratulations!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-tertiary/10 p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            You won a prize
          </p>
          <p className="mt-1 text-2xl font-headline font-bold text-on-surface">
            {formatUnits(amount, decimals)} {symbol}
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 bg-primary text-on-primary">
          Campaign #{campaign.id.toString()}
        </span>
      </div>
      <p
        className={`text-sm mb-4 ${
          deadlinePassed ? 'text-on-error-container' : 'text-on-surface-variant'
        }`}
      >
        {deadlinePassed
          ? 'Claim window has closed. The organizer can now reclaim unclaimed prizes.'
          : `Claim window closes in ${formatCountdown(secondsLeft)}.`}
      </p>
      <button
        type="button"
        disabled={busy || deadlinePassed}
        onClick={async () => {
          try {
            await claim(id);
            await refetch();
          } catch {
            // error surfaces via state
          }
        }}
        className="primary-gradient w-full rounded-xl py-3 text-base font-bold text-on-primary shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? 'Claiming…' : deadlinePassed ? 'Window closed' : `Claim ${formatUnits(amount, decimals)} ${symbol}`}
      </button>
      {state.status === 'error' ? (
        <p className="mt-3 rounded-lg bg-error-container/70 px-3 py-2 text-sm text-on-error-container">
          {state.error.message}
        </p>
      ) : null}
      {txHash ? (
        <a
          href={explorerTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Claim broadcast. View on ConfluxScan
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      ) : null}
    </div>
  );
}
