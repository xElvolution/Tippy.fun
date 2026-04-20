'use client';

import { useState } from 'react';
import { formatUnits } from 'viem';
import { useCampaign, useTipCampaign } from '@/hooks/useTippyCampaigns';
import { explorerTxUrl, getActiveChain } from '@/lib/conflux';
import { getTippyAddress, tokenByAddress } from '@/lib/contracts';

type Props = {
  /** On-chain campaign id (string from the server). Pass undefined/null for placeholder rows. */
  campaignId?: string | number | null;
  /** Fallback label for pure-demo rows with no on-chain campaign. */
  demoLabel?: string;
};

const PRESETS = ['1', '5', '20', '100'];

export function TipPanel({ campaignId, demoLabel = 'Participate now' }: Props) {
  const configured = Boolean(getTippyAddress());
  const id =
    campaignId !== null && campaignId !== undefined ? BigInt(campaignId) : undefined;
  const { campaign } = useCampaign(id);
  const { tip, state } = useTipCampaign();
  const [amount, setAmount] = useState('1');
  const [note, setNote] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const chain = getActiveChain();

  const token = campaign?.tokenInfo ?? tokenByAddress(campaign?.token);
  const symbol = token?.key ?? chain.nativeCurrency.symbol;
  const decimals = token?.decimals ?? 18;

  if (!configured || id === undefined) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          disabled
          className="primary-gradient w-full scroll-mt-28 rounded-2xl py-4 text-base font-bold shadow-[0_10px_28px_rgba(107,56,212,0.25)] opacity-70 cursor-not-allowed"
        >
          {demoLabel}
        </button>
        <p className="text-xs text-on-surface-variant text-center">
          {!configured
            ? 'On-chain actions become live once the contract address is configured.'
            : 'This is a sample campaign. Launch your own to receive real on-chain tips.'}
        </p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!token) {
      setErr('Unrecognized campaign token.');
      return;
    }
    try {
      await tip({ id: id!, token, amount, note: note.trim() || undefined });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const isBusy = state.status === 'pending';
  const txHash = state.status === 'success' ? state.hash : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">
          Tip amount ({symbol})
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                amount === p
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/40'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">
          Note (optional, on-chain)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={140}
          placeholder="gm, great work!"
          className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {campaign ? (
        <div className="rounded-xl bg-surface-container/60 px-4 py-3 text-xs text-on-surface-variant">
          Current prize pool:{' '}
          <span className="font-bold text-on-surface">
            {formatUnits(campaign.prizePool, decimals)} {symbol}
          </span>
          {campaign.finalized ? (
            <span className="ml-2 rounded-full bg-error-container px-2 py-0.5 text-[10px] font-bold uppercase text-on-error-container">
              Finalized
            </span>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isBusy || campaign?.finalized}
        className="primary-gradient w-full rounded-2xl py-4 text-base font-bold shadow-[0_10px_28px_rgba(107,56,212,0.25)] transition-opacity hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isBusy
          ? 'Confirming transaction…'
          : campaign?.finalized
            ? 'Campaign finalized'
            : `Tip ${amount} ${symbol}`}
      </button>

      {err ? (
        <p className="text-sm text-on-error-container bg-error-container/60 rounded-lg px-3 py-2">
          {err}
        </p>
      ) : null}

      {txHash ? (
        <a
          href={explorerTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View transaction on ConfluxScan
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      ) : null}
    </form>
  );
}
