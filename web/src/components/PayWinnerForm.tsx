'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Address } from 'viem';
import {
  useActiveWallet,
  useCampaign,
  usePayTip,
  useSettleWinners,
} from '@/hooks/useTippyCampaigns';
import { explorerTxUrl, getActiveChain, shortAddress } from '@/lib/conflux';
import { getTippyAddress, MODE_BOUNTY, MODE_TIP } from '@/lib/contracts';
import { hashCanonical } from '@/lib/hash';

export function PayWinnerForm() {
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const params = useSearchParams();
  const idParam = params.get('id');
  const idBig = idParam
    ? (() => {
        try {
          return BigInt(idParam);
        } catch {
          return undefined;
        }
      })()
    : undefined;

  const { address } = useActiveWallet();
  const { campaign } = useCampaign(idBig);
  const { settle, state: settleState } = useSettleWinners();
  const { pay: payTip, state: tipState } = usePayTip();

  const [winner, setWinner] = useState('');
  const [amount, setAmount] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const token = campaign?.tokenInfo;
  const mode = campaign ? Number(campaign.mode) : MODE_BOUNTY;
  const symbol = token?.key ?? chain.nativeCurrency.symbol;
  const isOrganizer =
    campaign && address ? campaign.organizer.toLowerCase() === address.toLowerCase() : false;
  const busy = settleState.status === 'pending' || tipState.status === 'pending';
  const hash =
    settleState.status === 'success'
      ? settleState.hash
      : tipState.status === 'success'
        ? tipState.hash
        : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!configured || idBig === undefined || !campaign || !token) {
      setErr('Open this page with ?id=<campaignId> on a deployed contract to enable payouts.');
      return;
    }
    try {
      // Local verdict hash if the organizer is paying out manually (vs. from the judging flow).
      const verdictHash = hashCanonical({
        manual: true,
        winner,
        amount,
        submissionId,
        note,
      });
      if (mode === MODE_TIP) {
        await payTip({
          id: idBig,
          to: winner as Address,
          amount,
          token,
          submissionId,
          verdictHash,
          payoutNote: note.trim() || undefined,
        });
      } else {
        await settle({
          id: idBig,
          token,
          winners: [{ address: winner as Address, amount, submissionId }],
          verdictHash,
          payoutNote: note.trim() || undefined,
        });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(17,28,45,0.04)]">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-headline text-on-surface">
            {mode === MODE_TIP ? 'Pay a tip' : 'Settle a winner'}
          </h2>
          <p className="text-sm text-on-surface-variant">
            Non-custodial payout on {chain.name}. Links the on-chain transfer to a submission hash
            and a verdict hash for the audit trail.
          </p>
        </div>
        {campaign ? (
          <div className="text-right text-xs text-on-surface-variant">
            <p>
              Campaign <span className="font-bold text-on-surface">#{campaign.id.toString()}</span>{' '}
              · {mode === MODE_TIP ? 'Tip mode' : 'Bounty mode'}
            </p>
            <p className="font-mono">Organizer {shortAddress(campaign.organizer)}</p>
          </div>
        ) : null}
      </div>

      {!configured || idBig === undefined ? (
        <p className="rounded-lg bg-surface-container/70 px-4 py-3 text-sm text-on-surface-variant">
          Open this page with <code className="font-mono">?id=&lt;campaignId&gt;</code> after
          deploying <code className="font-mono">TippyMaker</code> to enable real on-chain payouts.
        </p>
      ) : campaign && !isOrganizer ? (
        <p className="rounded-lg bg-error-container/60 px-4 py-3 text-sm text-on-error-container">
          Connect as the campaign organizer ({shortAddress(campaign.organizer)}) to settle winners.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Winner address
            </label>
            <input
              type="text"
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              required
              pattern="^0x[a-fA-F0-9]{40}$"
              placeholder="0x…"
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Amount ({symbol})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Submission id
            </label>
            <input
              type="text"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              required
              placeholder="discord:msg:123 or submission-uuid"
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Payout note (optional, on-chain)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder={
                mode === MODE_TIP
                  ? 'Passed AI arbiter · 82/100'
                  : 'Top submission · round 1'
              }
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-4">
            <p className="text-xs text-on-surface-variant">
              {mode === MODE_TIP
                ? 'Tip mode transfers instantly. The submission hash prevents double-paying the same post.'
                : 'Bounty mode reserves the amount for the winner; they claim within the campaign claim window.'}
            </p>
            <button
              type="submit"
              disabled={busy}
              className="primary-gradient rounded-xl px-8 py-4 text-base font-bold text-on-primary shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {busy ? 'Sending…' : mode === MODE_TIP ? 'Pay tip' : 'Settle winner'}
            </button>
          </div>
          {err ? (
            <p className="md:col-span-2 rounded-lg bg-error-container/70 px-3 py-2 text-sm text-on-error-container">
              {err}
            </p>
          ) : null}
          {hash ? (
            <a
              href={explorerTxUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="md:col-span-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Transaction broadcast — view on ConfluxScan
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          ) : null}
        </form>
      )}
    </section>
  );
}
