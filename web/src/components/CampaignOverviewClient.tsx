'use client';

import { useSearchParams } from 'next/navigation';
import { formatUnits } from 'viem';
import Link from 'next/link';
import { useCampaign } from '@/hooks/useTippyCampaigns';
import { explorerAddressUrl, getActiveChain, shortAddress } from '@/lib/conflux';
import { getTippyAddress, MODE_BOUNTY } from '@/lib/contracts';

export function CampaignOverviewClient() {
  const params = useSearchParams();
  const idParam = params.get('id');
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const idBig = idParam
    ? (() => {
        try {
          return BigInt(idParam);
        } catch {
          return undefined;
        }
      })()
    : undefined;
  const { campaign, isLoading } = useCampaign(idBig);

  if (!configured || idBig === undefined) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-headline text-on-surface mb-2">Overview</h2>
          <p className="text-on-surface-variant text-sm max-w-3xl leading-relaxed">
            Open <strong className="text-on-surface">Submissions</strong> to review entries,{' '}
            <strong className="text-on-surface">Judging</strong> for AI verdicts,{' '}
            <strong className="text-on-surface">Funds &amp; ledger</strong> for on-chain movements,
            and <strong className="text-on-surface">Payout</strong> when winners are ready.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
          Pass <code className="font-mono">?id=&lt;campaignId&gt;</code> to inspect an on-chain
          campaign, or{' '}
          <Link href="/create_campaign_wizard" className="font-semibold text-primary hover:underline">
            launch a new one
          </Link>
          .
        </div>
      </section>
    );
  }

  if (isLoading || !campaign) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-headline text-on-surface mb-2">Overview</h2>
          <p className="text-on-surface-variant text-sm">Loading campaign #{idBig.toString()}…</p>
        </div>
      </section>
    );
  }

  const title = campaign.metadata?.title ?? `Campaign #${campaign.id.toString()}`;
  const desc = campaign.metadata?.description ?? '';
  const channel = campaign.metadata?.channel ?? 'web';
  const status = campaign.finalized ? 'Finalized' : 'Live';
  const modeLabel = Number(campaign.mode) === MODE_BOUNTY ? 'Bounty' : 'Tip';
  const symbol = campaign.tokenInfo?.key ?? chain.nativeCurrency.symbol;
  const decimals = campaign.tokenInfo?.decimals ?? 18;
  const fmt = (v: bigint) => `${formatUnits(v, decimals)} ${symbol}`;
  const createdAt = new Date(Number(campaign.createdAt) * 1000).toLocaleString();
  const closeAt =
    campaign.submissionsClose > 0n
      ? new Date(Number(campaign.submissionsClose) * 1000).toLocaleString()
      : 'Open-ended';
  const claimAt =
    campaign.claimDeadline > 0n
      ? new Date(Number(campaign.claimDeadline) * 1000).toLocaleString()
      : '—';

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
              campaign.finalized
                ? 'bg-surface-variant text-on-surface-variant'
                : 'bg-tertiary-container text-on-tertiary-container'
            }`}
          >
            {status}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant">
            {modeLabel}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 bg-secondary-container text-on-secondary-container">
            {symbol}
          </span>
          <span className="text-xs text-on-surface-variant">
            #{campaign.id.toString()} · {chain.name}
          </span>
        </div>
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">{title}</h2>
        {desc ? (
          <p className="text-on-surface-variant text-sm max-w-3xl leading-relaxed">{desc}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Prize pool" value={fmt(campaign.prizePool)} accent />
        <Stat label="Tipped" value={fmt(campaign.totalTipped)} />
        <Stat label="Paid out" value={fmt(campaign.totalPaidOut)} />
        <Stat
          label="Reserved for winners"
          value={fmt(campaign.totalEntitled)}
          hint={modeLabel === 'Tip' ? 'N/A for Tip mode' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <InfoBlock label="Organizer">
          <a
            href={explorerAddressUrl(campaign.organizer)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono font-bold text-primary hover:underline"
          >
            {shortAddress(campaign.organizer, 6)}
          </a>
        </InfoBlock>
        <InfoBlock label="Channel">
          <span className="text-on-surface capitalize">{channel}</span>
        </InfoBlock>
        <InfoBlock label="Timeline">
          <p className="text-on-surface">
            Opened <span className="font-semibold">{createdAt}</span>
          </p>
          <p className="text-on-surface-variant">
            Submissions close: <span className="font-semibold">{closeAt}</span>
          </p>
          {Number(campaign.mode) === MODE_BOUNTY ? (
            <p className="text-on-surface-variant">
              Claim deadline: <span className="font-semibold">{claimAt}</span>
            </p>
          ) : null}
        </InfoBlock>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div className="bg-surface-container-lowest dark:bg-surface-container-low p-5 rounded-xl border border-outline-variant/15">
      <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-lg font-headline font-bold ${accent ? 'text-primary' : 'text-on-surface'}`}>
        {value}
      </p>
      {hint ? <p className="text-[10px] text-on-surface-variant mt-1">{hint}</p> : null}
    </div>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest dark:bg-surface-container-low p-5 rounded-xl border border-outline-variant/15">
      <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-2">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}
