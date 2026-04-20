'use client';

import { formatUnits } from 'viem';
import { useCampaign, useCampaignLedger } from '@/hooks/useTippyCampaigns';
import { explorerTxUrl, getActiveChain, shortAddress } from '@/lib/conflux';
import { getTippyAddress } from '@/lib/contracts';

const EVENT_STYLES: Record<string, { label: string; pill: string; sign?: '+' | '-' }> = {
  CampaignCreated: {
    label: 'Campaign created',
    pill: 'bg-surface-variant text-on-surface-variant',
  },
  Funded: { label: 'Deposit', pill: 'bg-secondary-container text-on-secondary-container', sign: '+' },
  Tipped: { label: 'Tip', pill: 'bg-primary-fixed text-on-primary-fixed-variant', sign: '+' },
  WinnerSettled: {
    label: 'Winner settled',
    pill: 'bg-tertiary-container text-on-tertiary-container',
  },
  PrizeClaimed: {
    label: 'Prize claimed',
    pill: 'bg-tertiary-container text-on-tertiary-container',
    sign: '-',
  },
  UnclaimedReclaimed: {
    label: 'Reclaimed',
    pill: 'bg-surface-variant text-on-surface-variant',
  },
  TipPaid: {
    label: 'Tip paid',
    pill: 'bg-tertiary-container text-on-tertiary-container',
    sign: '-',
  },
  CampaignFinalized: { label: 'Finalized', pill: 'bg-surface-variant text-on-surface-variant' },
};

export function OnChainLedger({ campaignId }: { campaignId?: string | number | null }) {
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const id = campaignId !== null && campaignId !== undefined ? BigInt(campaignId) : undefined;
  const { data, isLoading } = useCampaignLedger(id);
  const { campaign } = useCampaign(id);
  const symbol = campaign?.tokenInfo?.key ?? chain.nativeCurrency.symbol;
  const decimals = campaign?.tokenInfo?.decimals ?? 18;

  if (!configured || id === undefined) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
        <p className="font-semibold text-on-surface mb-1">On-chain ledger will appear here</p>
        <p>
          Once the <code className="font-mono">TippyMaker</code> contract is deployed on{' '}
          {chain.name} and you open an on-chain campaign, every deposit, tip, settlement, claim,
          and reclaim will stream in automatically.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
        Loading on-chain events…
      </div>
    );
  }

  const events = data ?? [];

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
        No on-chain activity yet for campaign #{id.toString()}.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/20">
      <div className="bg-surface-container-high px-6 py-4 flex items-center justify-between">
        <h3 className="font-headline font-bold text-on-surface">Transaction ledger</h3>
        <span className="text-[10px] font-bold text-tertiary px-2 py-0.5 bg-tertiary-container/20 rounded">
          Live · {chain.name}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-on-surface-variant text-xs font-bold uppercase tracking-wider bg-surface-container-low/50">
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">From / To</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-right">Tx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {[...events].reverse().map((ev) => {
              const style = EVENT_STYLES[ev.eventName as string] ?? {
                label: ev.eventName as string,
                pill: 'bg-surface-variant text-on-surface-variant',
              };
              const args = ev.args as Record<string, unknown>;
              const amount =
                (args.amount ??
                  args.seedAmount ??
                  args.refundedToOrganizer) as bigint | undefined;
              const from = (args.from ?? args.organizer) as string | undefined;
              const to = (args.to ?? args.winner) as string | undefined;
              const noteOrUri =
                (args.note as string | undefined) ??
                (args.payoutNote as string | undefined) ??
                (args.metadataURI as string | undefined);
              return (
                <tr
                  key={`${ev.transactionHash}-${ev.logIndex ?? 0}`}
                  className="group hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span
                        className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.pill}`}
                      >
                        {style.label}
                      </span>
                      {noteOrUri ? (
                        <span className="mt-1 text-xs text-on-surface-variant max-w-[260px] truncate">
                          {noteOrUri}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-mono text-on-surface-variant">
                    {to ? <>→ {shortAddress(to, 5)}</> : from ? shortAddress(from, 5) : '—'}
                  </td>
                  <td className="px-6 py-5 text-right font-headline font-bold text-on-surface tabular-nums">
                    {amount !== undefined ? (
                      <>
                        {style.sign ?? ''}
                        {formatUnits(amount, decimals)} {symbol}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <a
                      href={explorerTxUrl(ev.transactionHash ?? '')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-end gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Explorer
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
